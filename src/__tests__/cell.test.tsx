import CellCompositionFixture from '../cell/__fixtures__/examples/composition'
import { Fragment, useState } from 'react'
import { Cell, ConfigProvider, getDesignToken, getCellToken } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { getCellStyles } from '../cell/style'

interface JsonNode {
  children?: JsonNode[] | null
  props: Record<string, unknown>
  type: string
}

function findNodes(value: unknown, predicate: (node: JsonNode) => boolean): JsonNode[] {
  if (Array.isArray(value)) return value.flatMap((item) => findNodes(item, predicate))
  if (!value || typeof value !== 'object' || !('props' in value)) return []

  const node = value as JsonNode
  const matches = predicate(node) ? [node] : []

  return matches.concat(findNodes(node.children, predicate))
}

function findNode(value: unknown, predicate: (node: JsonNode) => boolean): JsonNode {
  const node = findNodes(value, predicate)[0]
  if (!node) throw new Error('Expected a matching native node')
  return node
}

function nodeStyle(node: JsonNode) {
  return StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}
}

function cellNode(tree: unknown, testID: string) {
  return findNode(tree, (node) => node.props.testID === testID)
}

function cellDividerCount(cell: JsonNode) {
  return findNodes(
    cell,
    (node) =>
      node !== cell && nodeStyle(node).position === 'absolute' && nodeStyle(node).bottom === 0,
  ).length
}

function groupHairlineCount(group: JsonNode) {
  return findNodes(group, (node) => {
    const style = nodeStyle(node)
    return (
      node !== group &&
      style.position === 'absolute' &&
      style.left === 0 &&
      style.right === 0 &&
      (style.top === 0 || style.bottom === 0)
    )
  }).length
}

const press = (instance: Parameters<typeof fireEvent.press>[0]) => fireEvent.press(instance)

describe('Cell', () => {
  it('does not render a divider for a standalone Cell', async () => {
    const view = await render(<Cell testID="single" />)

    expect(cellDividerCount(cellNode(view.toJSON(), 'single'))).toBe(0)
  })

  it('allows divider to override automatic positioning while respecting border', async () => {
    const { toJSON: standaloneToJSON } = await render(
      <>
        <Cell testID="opened" divider />
        <Cell testID="closed" divider={false} />
        <Cell testID="blocked" border={false} divider />
      </>,
    )
    const standaloneTree = standaloneToJSON()
    expect(cellDividerCount(cellNode(standaloneTree, 'opened'))).toBe(1)
    expect(cellDividerCount(cellNode(standaloneTree, 'closed'))).toBe(0)
    expect(cellDividerCount(cellNode(standaloneTree, 'blocked'))).toBe(0)

    const { toJSON: groupToJSON } = await render(
      <Cell.Group border={false}>
        <Cell testID="group-first" divider={false} />
        <Cell testID="group-last" divider />
      </Cell.Group>,
    )
    const groupTree = groupToJSON()
    expect(cellDividerCount(cellNode(groupTree, 'group-first'))).toBe(0)
    expect(cellDividerCount(cellNode(groupTree, 'group-last'))).toBe(1)

    const { toJSON: blockedLastToJSON } = await render(
      <Cell.Group>
        <Cell />
        <Cell testID="blocked-last" border={false} divider />
      </Cell.Group>,
    )
    expect(cellDividerCount(cellNode(blockedLastToJSON(), 'blocked-last'))).toBe(0)
  })

  it('keeps Cell dividers independent from group borders', async () => {
    const { toJSON: borderedToJSON } = await render(
      <Cell.Group testID="single-group">
        <Cell testID="only" />
      </Cell.Group>,
    )
    const borderedTree = borderedToJSON()
    expect(cellDividerCount(cellNode(borderedTree, 'only'))).toBe(0)
    expect(groupHairlineCount(cellNode(borderedTree, 'single-group'))).toBe(2)

    const { toJSON: borderlessToJSON } = await render(
      <Cell.Group testID="borderless-group" border={false}>
        <Cell testID="first" />
        <Cell testID="last" />
      </Cell.Group>,
    )
    const borderlessTree = borderlessToJSON()
    expect(cellDividerCount(cellNode(borderlessTree, 'first'))).toBe(1)
    expect(cellDividerCount(cellNode(borderlessTree, 'last'))).toBe(0)
    expect(groupHairlineCount(cellNode(borderlessTree, 'borderless-group'))).toBe(0)
  })

  it('flattens nested arrays and Fragments when assigning group positions', async () => {
    const { toJSON } = await render(
      <Cell.Group>
        {[
          <Cell key="first" testID="first" />,
          [
            <>
              <Cell testID="middle" />
              <Cell testID="last" />
            </>,
          ],
        ]}
      </Cell.Group>,
    )
    const tree = toJSON()

    expect(cellDividerCount(cellNode(tree, 'first'))).toBe(1)
    expect(cellDividerCount(cellNode(tree, 'middle'))).toBe(1)
    expect(cellDividerCount(cellNode(tree, 'last'))).toBe(0)
  })

  it('keeps middle dividers and honors Cell border=false in groups', async () => {
    const view = await render(
      <Cell.Group>
        <Cell testID="first" />
        <Cell testID="middle" />
        <Cell testID="last" />
      </Cell.Group>,
    )
    const tree = view.toJSON()
    expect(cellDividerCount(cellNode(tree, 'first'))).toBe(1)
    expect(cellDividerCount(cellNode(tree, 'middle'))).toBe(1)
    expect(cellDividerCount(cellNode(tree, 'last'))).toBe(0)

    const { toJSON: insetToJSON } = await render(
      <Cell.Group inset testID="inset-group">
        <Cell testID="inset-first" border={false} />
        <Cell testID="inset-last" />
      </Cell.Group>,
    )
    const insetTree = insetToJSON()
    expect(cellDividerCount(cellNode(insetTree, 'inset-first'))).toBe(0)
    expect(cellDividerCount(cellNode(insetTree, 'inset-last'))).toBe(0)
    expect(groupHairlineCount(cellNode(insetTree, 'inset-group'))).toBe(0)
  })

  it('uses top alignment for the default row and center for the center modifier', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="default" title="默认" />
        <Cell testID="center" title="居中" center />
      </ConfigProvider>,
    )

    const defaultRow = findNode(
      cellNode(view.toJSON(), 'default'),
      (node) => nodeStyle(node).flexDirection === 'row',
    )
    const centerRow = findNode(
      cellNode(view.toJSON(), 'center'),
      (node) => nodeStyle(node).flexDirection === 'row',
    )

    expect(nodeStyle(defaultRow).alignItems).toBe('flex-start')
    expect(nodeStyle(centerRow).alignItems).toBe('center')
  })

  it('uses Vant normal and large padding and typography tokens', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="normal" title="普通" description="说明" />
        <Cell testID="large" size="large" title="大号" description="说明" />
      </ConfigProvider>,
    )

    const normalRow = findNode(view.toJSON(), (node) => nodeStyle(node).flexDirection === 'row')
    const largeRow = findNode(view.toJSON(), (node) => nodeStyle(node).paddingVertical === 12)
    const normalTitle = screen.getByText('普通')
    const largeTitle = screen.getByText('大号')
    const normalLabel = screen.getAllByText('说明')[0]
    const largeLabel = screen.getAllByText('说明')[1]

    expect(nodeStyle(normalRow)).toMatchObject({ paddingHorizontal: 16, paddingVertical: 10 })
    expect(nodeStyle(largeRow)).toMatchObject({ paddingHorizontal: 16, paddingVertical: 12 })
    expect(StyleSheet.flatten(normalTitle.props.style)).toMatchObject({ fontSize: 14 })
    expect(StyleSheet.flatten(largeTitle.props.style)).toMatchObject({ fontSize: 16 })
    expect(StyleSheet.flatten(normalLabel.props.style)).toMatchObject({
      fontSize: 12,
      marginTop: 4,
    })
    expect(StyleSheet.flatten(largeLabel.props.style)).toMatchObject({
      fontSize: 14,
      marginTop: 4,
    })
  })

  it('sizes the title to content and gives value the remaining width', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="title-only" title="A very long title that should be allowed to shrink" />
        <Cell testID="value-only" value="A very long value that should be allowed to shrink" />
        <Cell
          testID="title-value"
          title="A very long title that should be allowed to shrink"
          value="A very long value that should be allowed to shrink"
        />
      </ConfigProvider>,
    )

    const titleValueMain = findNode(
      cellNode(view.toJSON(), 'title-value'),
      (node) => nodeStyle(node).flex === 1 && nodeStyle(node).flexDirection === 'row',
    )
    const valueOnlyMain = findNode(
      cellNode(view.toJSON(), 'value-only'),
      (node) => nodeStyle(node).flex === 1 && nodeStyle(node).flexDirection === 'row',
    )
    const titleArea = findNode(
      cellNode(view.toJSON(), 'title-value'),
      (node) => nodeStyle(node).flexBasis === 'auto' && nodeStyle(node).flexShrink === 1,
    )
    const valueArea = findNode(
      cellNode(view.toJSON(), 'title-value'),
      (node) => nodeStyle(node).flex === 1 && nodeStyle(node).flexDirection === 'row',
    )

    const titleOnlyMain = findNode(
      cellNode(view.toJSON(), 'title-only'),
      (node) => nodeStyle(node).flex === 1 && nodeStyle(node).flexDirection === 'row',
    )

    expect(nodeStyle(titleArea)).toMatchObject({
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
      minWidth: 0,
      marginRight: 4,
    })
    expect(nodeStyle(valueArea)).toMatchObject({ flex: 1, minWidth: 0 })
    expect(
      (titleValueMain.children ?? []).filter((child) => nodeStyle(child).flex === 1),
    ).toHaveLength(1)
    expect(
      (valueOnlyMain.children ?? []).filter((child) => nodeStyle(child).flex === 1),
    ).toHaveLength(1)
    expect(
      (titleOnlyMain.children ?? []).filter((child) => nodeStyle(child).flex === 1),
    ).toHaveLength(0)
  })

  it('keeps the label spacing in title and label combinations', async () => {
    await render(
      <ConfigProvider>
        <Cell title="标题" description="辅助说明" value="值" />
      </ConfigProvider>,
    )

    expect(StyleSheet.flatten(screen.getByText('辅助说明').props.style)).toMatchObject({
      fontSize: 12,
      marginTop: 4,
    })
  })

  it('accepts ReactNode values and extra content', async () => {
    await render(
      <Cell
        title="群管理员"
        value={<Text testID="value-node">林默</Text>}
        trailing={
          <>
            <Text testID="extra-count">2/5 人</Text>
            <Text testID="extra-icon">›</Text>
          </>
        }
      />,
    )

    expect(screen.getByTestId('value-node')).toBeTruthy()
    expect(screen.getByTestId('extra-count')).toBeTruthy()
    expect(screen.getByTestId('extra-icon')).toBeTruthy()
  })

  it('keeps titleExtra, valueExtra and extra in their dedicated slots', async () => {
    await render(
      <Cell
        title="标题"
        titleExtra={<Text testID="title-extra">说明</Text>}
        value="值"
        valueExtra={<Text testID="value-extra">单位</Text>}
        trailing={<Text testID="extra">操作</Text>}
      />,
    )

    expect(screen.getByTestId('title-extra')).toBeTruthy()
    expect(screen.getByTestId('value-extra')).toBeTruthy()
    expect(screen.getByTestId('extra')).toBeTruthy()
  })

  it('centers custom titleExtra and valueExtra within their rows', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell
          testID="title-extra"
          vertical
          title="标题"
          titleExtra={<Text testID="title-extra-node">说明</Text>}
        />
        <Cell
          testID="value-extra"
          vertical
          value="值"
          valueExtra={<Text testID="value-extra-node">单位</Text>}
        />
      </ConfigProvider>,
    )

    const titleExtraContainer = findNode(
      cellNode(view.toJSON(), 'title-extra'),
      (node) => nodeStyle(node).alignSelf === 'center',
    )
    const valueExtraContainer = findNode(
      cellNode(view.toJSON(), 'value-extra'),
      (node) => nodeStyle(node).alignSelf === 'center',
    )

    expect(nodeStyle(titleExtraContainer).alignSelf).toBe('center')
    expect(nodeStyle(valueExtraContainer).alignSelf).toBe('center')
    expect(screen.getByTestId('title-extra-node')).toBeTruthy()
    expect(screen.getByTestId('value-extra-node')).toBeTruthy()
  })

  it('changes only Main direction in vertical mode and keeps trailing content horizontal', async () => {
    const view = await render(
      <Cell
        testID="vertical"
        vertical
        title="标题"
        value="值"
        trailing={<Text testID="vertical-extra">操作</Text>}
        showArrow
      />,
    )

    const row = findNode(
      cellNode(view.toJSON(), 'vertical'),
      (node) => nodeStyle(node).minHeight !== undefined && nodeStyle(node).flexDirection === 'row',
    )
    const main = findNode(
      cellNode(view.toJSON(), 'vertical'),
      (node) => nodeStyle(node).flexDirection === 'column',
    )

    expect(nodeStyle(row).flexDirection).toBe('row')
    expect(nodeStyle(main).flexDirection).toBe('column')
    expect(screen.getByTestId('vertical-extra')).toBeTruthy()
  })

  it('preserves trailing space in vertical mode and lets the row own alignment', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="default-extra" vertical title="标题" value="这是一段多行值" trailing="操作" />
        <Cell
          testID="centered-extra"
          vertical
          center
          title="标题"
          value="这是一段多行值"
          trailing={<Text testID="centered-extra-node">操作</Text>}
        />
      </ConfigProvider>,
    )

    const defaultExtraContainer = findNode(
      cellNode(view.toJSON(), 'default-extra'),
      (node) => nodeStyle(node).flexShrink === 0 && nodeStyle(node).marginLeft !== undefined,
    )
    const centeredExtraContainer = findNode(
      cellNode(view.toJSON(), 'centered-extra'),
      (node) => nodeStyle(node).flexShrink === 0 && nodeStyle(node).marginLeft !== undefined,
    )

    expect(nodeStyle(defaultExtraContainer).justifyContent).toBe('center')
    expect(nodeStyle(centeredExtraContainer).justifyContent).toBe('center')
    expect(screen.getByTestId('centered-extra-node')).toBeTruthy()
  })

  it('defaults vertical values to left alignment and horizontal values to right alignment', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="horizontal" title="标题" value="横向值" />
        <Cell testID="vertical" vertical title="标题" value="纵向值" />
      </ConfigProvider>,
    )

    const horizontalValueArea = findNode(
      cellNode(view.toJSON(), 'horizontal'),
      (node) =>
        nodeStyle(node).flex === 1 &&
        nodeStyle(node).flexDirection === 'row' &&
        nodeStyle(node).justifyContent !== undefined,
    )
    const verticalValueArea = findNode(
      cellNode(view.toJSON(), 'vertical'),
      (node) => nodeStyle(node).width === '100%' && nodeStyle(node).flexDirection === 'row',
    )

    expect(nodeStyle(horizontalValueArea).justifyContent).toBe('flex-end')
    expect(nodeStyle(verticalValueArea).justifyContent).toBe('flex-start')
    expect(StyleSheet.flatten(screen.getByText('纵向值').props.style)).toMatchObject({
      textAlign: 'left',
    })
  })

  it('puts required in the title row and applies primitive line limits', async () => {
    await render(
      <Cell testID="limited" title="标题" titleLines={1} value="值" valueLines={2} required />,
    )

    const title = screen.getByText('标题')
    const value = screen.getByText('值')
    expect(title.props.numberOfLines).toBe(1)
    expect(value.props.numberOfLines).toBe(2)
    expect(screen.getByText('*')).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByText('*').props.style)).toMatchObject({
      position: 'absolute',
      left: -8,
      top: 0,
    })
    expect(StyleSheet.flatten(screen.getByText('*').parent?.props.style)).toMatchObject({
      flexDirection: 'row',
      position: 'relative',
    })
  })

  it('keeps value content top-aligned by default and centers it with center', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="default" title="标题" description="辅助说明" value="值" />
        <Cell testID="center" title="标题" description="辅助说明" value="值" center />
      </ConfigProvider>,
    )

    const defaultValueContainer = findNode(
      cellNode(view.toJSON(), 'default'),
      (node) => nodeStyle(node).flex === 1 && nodeStyle(node).alignItems === 'flex-start',
    )
    const centeredValueContainer = findNode(
      cellNode(view.toJSON(), 'center'),
      (node) => nodeStyle(node).flex === 1 && nodeStyle(node).alignItems === 'center',
    )

    expect(nodeStyle(defaultValueContainer).alignItems).toBe('flex-start')
    expect(nodeStyle(centeredValueContainer).alignItems).toBe('center')
  })

  it('keeps the link suffix in the same line-height box as the cell text', () => {
    const token = getCellToken(getDesignToken())
    const resolved = getCellStyles(token, { showArrow: true }, { pressed: false, disabled: false })

    expect(resolved.arrow).toMatchObject({ height: token.lineHeight })
  })

  it('keeps the icon slot at its minimum size while allowing larger nodes to size it', () => {
    const token = getCellToken(getDesignToken())
    const resolved = getCellStyles(token, {}, { pressed: false, disabled: false })

    expect(resolved.leading).not.toHaveProperty('width')
    expect(resolved.leading).not.toHaveProperty('height')
    expect(resolved.leading).toMatchObject({
      minWidth: token.iconSize,
      minHeight: token.lineHeight,
      marginRight: token.iconGap,
      flexShrink: 0,
    })
  })

  it('renders the group title outside the cells body', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell.Group testID="group" title="基本信息">
          <Cell title="昵称" value="Altron" border={false} />
        </Cell.Group>
      </ConfigProvider>,
    )

    const group = cellNode(view.toJSON(), 'group')
    const groupChildren = group.children ?? []
    const cellToken = getCellToken(getDesignToken())
    const body = findNode(
      group,
      (node) => nodeStyle(node).backgroundColor === cellToken.groupBackgroundColor,
    )

    expect(groupChildren).toHaveLength(2)
    expect(groupChildren[0]).not.toBe(body)
    expect(nodeStyle(group)).not.toMatchObject({
      backgroundColor: cellToken.groupBackgroundColor,
      borderRadius: cellToken.insetRadius,
      marginHorizontal: cellToken.groupInsetMarginHorizontal,
    })
    expect(nodeStyle(body)).toMatchObject({ backgroundColor: cellToken.groupBackgroundColor })
    expect(screen.getByText('基本信息')).toBeTruthy()
  })

  it('uses the inset radius and keeps inset group borders out of the body', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell.Group testID="inset-group" title="基本信息" inset>
          <Cell title="昵称" value="Altron" />
        </Cell.Group>
      </ConfigProvider>,
    )

    const group = cellNode(view.toJSON(), 'inset-group')
    const body = findNode(group, (node) => nodeStyle(node).borderRadius === 8)

    expect(nodeStyle(body)).toMatchObject({
      marginHorizontal: 16,
      borderRadius: 8,
      overflow: 'hidden',
    })
    expect(nodeStyle(body).borderWidth).toBeUndefined()
    expect(
      findNodes(body, (node) => {
        const style = nodeStyle(node)
        return style.position === 'absolute' && (style.top === 0 || style.bottom === 0)
      }),
    ).toHaveLength(0)
  })

  it('adds top and bottom hairlines only to a normal bordered group', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell.Group testID="normal-group">
          <Cell title="第一项" />
          <Cell title="第二项" />
        </Cell.Group>
      </ConfigProvider>,
    )

    const group = cellNode(view.toJSON(), 'normal-group')
    const cellToken = getCellToken(getDesignToken())
    const body = findNode(
      group,
      (node) => nodeStyle(node).backgroundColor === cellToken.groupBackgroundColor,
    )
    const lines = findNodes(body, (node) => {
      const style = nodeStyle(node)
      return (
        style.position === 'absolute' &&
        style.left === 0 &&
        style.right === 0 &&
        (style.top === 0 || style.bottom === 0)
      )
    })
    expect(nodeStyle(group).borderWidth).toBeUndefined()
    expect(lines).toHaveLength(2)
    expect(lines.map((line) => nodeStyle(line))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ top: 0, height: cellToken.groupBorderWidth }),
        expect.objectContaining({ bottom: 0, height: cellToken.groupBorderWidth }),
      ]),
    )
  })

  it('does not render group border hairlines when border is false', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell.Group testID="borderless-group" border={false}>
          <Cell title="第一项" />
          <Cell title="第二项" />
        </Cell.Group>
      </ConfigProvider>,
    )

    const body = findNode(
      cellNode(view.toJSON(), 'borderless-group'),
      (node) =>
        nodeStyle(node).backgroundColor === getCellToken(getDesignToken()).groupBackgroundColor,
    )

    expect(
      findNodes(body, (node) => {
        const style = nodeStyle(node)
        return (
          style.position === 'absolute' &&
          style.left === 0 &&
          style.right === 0 &&
          (style.top === 0 || style.bottom === 0)
        )
      }),
    ).toHaveLength(0)
  })

  it('hides only the last cell divider through group position context', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell.Group>
          <Cell testID="first" title="第一项" />
          <Cell testID="last" title="第二项" />
        </Cell.Group>
      </ConfigProvider>,
    )

    expect(cellDividerCount(cellNode(view.toJSON(), 'first'))).toBe(1)
    expect(cellDividerCount(cellNode(view.toJSON(), 'last'))).toBe(0)
  })

  it('honors border={false} for a standalone cell', async () => {
    const view = await render(<Cell testID="borderless" title="无分割线" border={false} />)

    expect(cellDividerCount(cellNode(view.toJSON(), 'borderless'))).toBe(0)
  })

  it('keeps arrow display separate from feedback and preserves the default pressed background', async () => {
    await render(
      <ConfigProvider>
        <Cell testID="link" title="链接" showArrow />
        <Cell testID="not-clickable" title="静态链接" showArrow clickable={false} />
        <Cell testID="explicit-clickable" title="可点击" clickable />
      </ConfigProvider>,
    )
    const pressedBackgroundColor = getCellToken(getDesignToken()).pressedBackgroundColor

    expect(screen.getByTestId('link').props.accessibilityRole).toBeUndefined()
    expect(
      getCellStyles(
        getCellToken(getDesignToken()),
        { showArrow: true },
        { pressed: true, disabled: false },
      ).root.backgroundColor,
    ).toBe(getCellToken(getDesignToken()).backgroundColor)
    expect(
      getCellStyles(
        getCellToken(getDesignToken()),
        { showArrow: true, clickable: false },
        { pressed: true, disabled: false },
      ).root.backgroundColor,
    ).toBe(getCellToken(getDesignToken()).backgroundColor)
    expect(
      getCellStyles(
        getCellToken(getDesignToken()),
        { clickable: true },
        { pressed: true, disabled: false },
      ).root.backgroundColor,
    ).toBe(getCellToken(getDesignToken()).backgroundColor)

    const view = await render(
      <ConfigProvider theme={{ token: { pressedBackgroundColor } }}>
        <Cell
          testID="normal-styled"
          title="正常"
          onPress={() => {}}
          style={{ backgroundColor: '#ffffff' }}
        />
        <Cell
          testID="pressed-styled"
          title="按下样式"
          onPress={() => {}}
          style={{ backgroundColor: '#ffffff' }}
          testOnly_pressed
        />
        <Cell testID="pressed" title="按下" onPress={() => {}} testOnly_pressed />
        <Cell testID="not-clickable-pressed" title="静态" clickable={false} testOnly_pressed />
        <Cell testID="disabled-pressed" title="禁用" disabled onPress={() => {}} testOnly_pressed />
      </ConfigProvider>,
    )

    expect(nodeStyle(cellNode(view.toJSON(), 'normal-styled')).backgroundColor).toBe('#ffffff')
    expect(nodeStyle(cellNode(view.toJSON(), 'pressed-styled')).backgroundColor).toBe(
      pressedBackgroundColor,
    )
    expect(nodeStyle(cellNode(view.toJSON(), 'pressed')).backgroundColor).toBe(
      pressedBackgroundColor,
    )
    expect(nodeStyle(cellNode(view.toJSON(), 'not-clickable-pressed')).backgroundColor).toBe(
      getCellToken(getDesignToken()).backgroundColor,
    )
    expect(nodeStyle(cellNode(view.toJSON(), 'disabled-pressed')).backgroundColor).toBe(
      getCellToken(getDesignToken()).backgroundColor,
    )
    expect(
      findNodes(cellNode(view.toJSON(), 'pressed'), (node) => node.props.pointerEvents === 'none'),
    ).toHaveLength(0)
  })

  it('keeps Cell press behavior and dividers after Interaction migration', async () => {
    const onPress = jest.fn()
    const view = await render(
      <ConfigProvider>
        <Cell.Group>
          <Cell testID="interactive" title="可点击" onPress={onPress} />
          <Cell testID="disabled" title="不可点击" disabled onPress={onPress} />
        </Cell.Group>
      </ConfigProvider>,
    )

    await press(screen.getByTestId('interactive'))
    await press(screen.getByTestId('disabled'))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('interactive').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('disabled').props.accessibilityState?.disabled).toBe(true)
    expect(cellDividerCount(cellNode(view.toJSON(), 'interactive'))).toBe(1)
  })

  it('applies Cell component token overrides to group semantics', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          components: {
            Cell: {
              groupTitleFontSize: 18,
              insetRadius: 12,
            },
          },
        }}
      >
        <Cell.Group testID="themed-group" title="主题分组" inset>
          <Cell title="项目" />
        </Cell.Group>
      </ConfigProvider>,
    )

    const group = cellNode(view.toJSON(), 'themed-group')
    const body = findNode(group, (node) => nodeStyle(node).borderRadius === 12)

    expect(StyleSheet.flatten(screen.getByText('主题分组').props.style)).toMatchObject({
      fontSize: 18,
    })
    expect(nodeStyle(body).borderRadius).toBe(12)
  })

  it('passes Cell divider token overrides to the Divider primitive', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          components: {
            Cell: {
              borderColor: '#1677ff',
              dividerWidth: 2,
            },
          },
        }}
      >
        <Cell.Group border={false}>
          <Cell testID="themed-cell" title="主题分割线" />
          <Cell title="最后一项" />
        </Cell.Group>
      </ConfigProvider>,
    )

    const divider = findNode(
      cellNode(view.toJSON(), 'themed-cell'),
      (node) => nodeStyle(node).position === 'absolute' && nodeStyle(node).bottom === 0,
    )

    expect(nodeStyle(divider)).toMatchObject({
      backgroundColor: '#1677ff',
      height: 2,
      left: 16,
      right: 16,
    })
    expect(divider.props).toMatchObject({ accessible: false, role: 'none' })
  })
  it('uses the same visibility rules for rendering and vertical spacing', async () => {
    const view = await render(
      <Cell
        testID="empty-header"
        vertical
        title={null}
        description={false}
        titleExtra={false}
        value={0}
        styles={{ valueContainer: { borderRadius: 17 } }}
      />,
    )
    expect(screen.getByText('0')).toBeTruthy()
    const valueContainer = findNode(
      cellNode(view.toJSON(), 'empty-header'),
      (node) => nodeStyle(node).borderRadius === 17,
    )
    expect(nodeStyle(valueContainer).marginTop).toBeUndefined()
  })

  it('styles custom node containers without injecting text styles into the nodes', async () => {
    const view = await render(
      <Cell
        testID="composition"
        leading={
          <Text testID="avatar" style={{ height: 48 }}>
            Avatar
          </Text>
        }
        title="姓名"
        description="多行说明"
        titleExtra={<Text testID="custom-title-extra">标签</Text>}
        valueExtra={<Text testID="custom-value-extra">单位</Text>}
        trailing={<Text testID="custom-trailing">操作</Text>}
        styles={{
          leading: { marginRight: 12 },
          titleExtraContainer: { marginLeft: 13 },
          valueExtraContainer: { marginLeft: 14 },
          trailingContainer: { maxWidth: 80, flexShrink: 1 },
          titleExtra: { color: '#ff0000' },
          valueExtra: { color: '#ff0000' },
          trailing: { color: '#ff0000' },
        }}
      />,
    )
    const cell = cellNode(view.toJSON(), 'composition')
    expect(findNode(cell, (node) => nodeStyle(node).marginRight === 12)).toBeTruthy()
    expect(findNode(cell, (node) => nodeStyle(node).marginLeft === 13)).toBeTruthy()
    expect(findNode(cell, (node) => nodeStyle(node).marginLeft === 14)).toBeTruthy()
    expect(nodeStyle(findNode(cell, (node) => nodeStyle(node).maxWidth === 80)).flexShrink).toBe(1)
    expect(StyleSheet.flatten(screen.getByTestId('avatar').props.style)).toEqual({ height: 48 })
    for (const id of ['custom-title-extra', 'custom-value-extra', 'custom-trailing']) {
      expect(StyleSheet.flatten(screen.getByTestId(id).props.style)?.color).toBeUndefined()
    }
  })

  it('exposes container padding independently of root styles', async () => {
    const view = await render(
      <Cell
        testID="padding"
        title="标题"
        styles={{ root: { borderRadius: 8 }, container: { paddingHorizontal: 22 } }}
        style={{ borderRadius: 9 }}
      />,
    )
    const cell = cellNode(view.toJSON(), 'padding')
    expect(nodeStyle(cell).borderRadius).toBe(9)
    expect(
      nodeStyle(findNode(cell, (node) => nodeStyle(node).paddingHorizontal === 22))
        .paddingHorizontal,
    ).toBe(22)
  })

  it('preserves explicit roles and derives feedback from callbacks instead of the arrow', async () => {
    const onPress = jest.fn()
    const onLongPress = jest.fn()
    const view = await render(
      <>
        <Cell testID="arrow-only" showArrow testOnly_pressed />
        <Cell testID="link-role" onPress={onPress} accessibilityRole="link" />
        <Cell testID="long-press" onLongPress={onLongPress} testOnly_pressed />
      </>,
    )
    expect(screen.getByTestId('link-role').props.accessibilityRole).toBe('link')
    expect(nodeStyle(cellNode(view.toJSON(), 'arrow-only')).backgroundColor).toBe(
      getCellToken(getDesignToken()).backgroundColor,
    )
    expect(nodeStyle(cellNode(view.toJSON(), 'long-press')).backgroundColor).toBe(
      getCellToken(getDesignToken()).pressedBackgroundColor,
    )
    await press(screen.getByTestId('link-role'))
    fireEvent(screen.getByTestId('long-press'), 'longPress')
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onLongPress).toHaveBeenCalledTimes(1)
  })

  it('lets function styles override pressed background and receives native props', async () => {
    const view = await render(
      <Cell
        testID="custom-pressed"
        accessibilityLabel="自定义"
        onPress={() => {}}
        testOnly_pressed
        style={{ backgroundColor: '#ffffff' }}
        styles={({ props, state }) => ({
          root: {
            backgroundColor:
              state.pressed && props.accessibilityLabel === '自定义' ? '#123456' : '#654321',
          },
        })}
      />,
    )
    expect(nodeStyle(cellNode(view.toJSON(), 'custom-pressed')).backgroundColor).toBe('#123456')
  })

  it('preserves state when keyed groups and fragments are inserted or reordered', async () => {
    function StatefulCell({ id }: { id: string }) {
      const [count, setCount] = useState(0)
      return <Cell testID={id} title={`${id}:${count}`} onPress={() => setCount(count + 1)} />
    }
    const rows = (order: string[]) => (
      <Cell.Group>
        {order.map((id) => (
          <Fragment key={id}>
            <StatefulCell id={id} />
          </Fragment>
        ))}
      </Cell.Group>
    )
    const view = await render(rows(['a', 'b']))
    await press(screen.getByTestId('b'))
    expect(screen.getByText('b:1')).toBeTruthy()
    await view.rerender(rows(['c', 'b', 'a']))
    expect(screen.getByText('b:1')).toBeTruthy()
    expect(cellDividerCount(cellNode(view.toJSON(), 'b'))).toBe(1)
    expect(cellDividerCount(cellNode(view.toJSON(), 'a'))).toBe(0)
    await view.rerender(rows(['b']))
    expect(screen.getByText('b:1')).toBeTruthy()
    expect(cellDividerCount(cellNode(view.toJSON(), 'b'))).toBe(0)
  })
  it('toggles the composed selection through the whole Cell with one accessible checkbox', async () => {
    await render(<CellCompositionFixture />)
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    expect(
      screen.getByRole('checkbox', { name: '选择万小安' }).props.accessibilityState.checked,
    ).toBe(false)
    await press(screen.getByText('选择人员'))
    expect(screen.getByText('已选择')).toBeTruthy()
    expect(
      screen.getByRole('checkbox', { name: '选择万小安' }).props.accessibilityState.checked,
    ).toBe(true)
    await press(screen.getByRole('checkbox', { name: '选择万小安' }))
    expect(screen.getByText('未选择')).toBeTruthy()
  })
  it('wraps primitive array and Fragment contents while preserving custom nodes', async () => {
    await render(
      <Cell
        title={[
          '姓名',
          <Fragment key="nested">
            {0}
            <Text testID="custom-array-node" style={{ color: '#123456' }}>
              自定义
            </Text>
          </Fragment>,
        ]}
        description={<Fragment>说明</Fragment>}
        value={['值']}
        titleLines={1}
        valueLines={2}
        styles={{ title: { color: '#ff0000' }, description: { color: '#00ff00' } }}
      />,
    )
    expect(screen.getByText('姓名').props.numberOfLines).toBe(1)
    expect(screen.getByText('0').props.numberOfLines).toBe(1)
    expect(screen.getByText('值').props.numberOfLines).toBe(2)
    expect(StyleSheet.flatten(screen.getByText('说明').props.style).color).toBe('#00ff00')
    expect(StyleSheet.flatten(screen.getByTestId('custom-array-node').props.style).color).toBe(
      '#123456',
    )
  })

  it.each([
    [],
    [null, false],
    <Fragment key="empty">
      {null}
      {false}
    </Fragment>,
  ])('omits empty nested regions and their vertical spacing %#', async (empty) => {
    const view = await render(
      <Cell
        testID="empty-nested"
        vertical
        title={empty}
        description={empty}
        titleExtra={empty}
        leading={empty}
        trailing={empty}
        value="内容"
        styles={{ valueContainer: { borderRadius: 31 } }}
      />,
    )
    const tree = cellNode(view.toJSON(), 'empty-nested')
    expect(
      nodeStyle(findNode(tree, (node) => nodeStyle(node).borderRadius === 31)).marginTop,
    ).toBeUndefined()
    expect(
      findNodes(
        tree,
        (node) =>
          nodeStyle(node).marginLeft !== undefined || nodeStyle(node).marginRight !== undefined,
      ),
    ).toHaveLength(0)
  })

  it('does not indent adjacent extensions when their main content is absent', async () => {
    const view = await render(
      <Cell
        testID="extensions-only"
        vertical
        titleExtra="标题扩展"
        valueExtra="值扩展"
        styles={{
          titleExtraContainer: { borderRadius: 32 },
          valueExtraContainer: { borderRadius: 33 },
        }}
      />,
    )
    const tree = cellNode(view.toJSON(), 'extensions-only')
    for (const radius of [32, 33]) {
      expect(
        nodeStyle(findNode(tree, (node) => nodeStyle(node).borderRadius === radius)).marginLeft,
      ).toBeUndefined()
    }
  })
})
