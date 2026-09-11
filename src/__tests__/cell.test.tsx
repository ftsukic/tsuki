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

const press = (instance: Parameters<typeof fireEvent.press>[0]) => fireEvent.press(instance)

describe('Cell', () => {
  it('uses stretch for the default row and center for the center modifier', async () => {
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

    expect(nodeStyle(defaultRow).alignItems).toBe('stretch')
    expect(nodeStyle(centerRow).alignItems).toBe('center')
  })

  it('uses Vant normal and large padding and typography tokens', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="normal" title="普通" label="说明" />
        <Cell testID="large" size="large" title="大号" label="说明" />
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

  it('gives title and value areas equal flexible columns without a value minimum width', async () => {
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
    const titleValueFlexChildren = (titleValueMain.children ?? []).filter(
      (child) => nodeStyle(child).flex === 1,
    )
    const valueOnlyFlexChildren = (valueOnlyMain.children ?? []).filter(
      (child) => nodeStyle(child).flex === 1,
    )

    const titleOnlyMain = findNode(
      cellNode(view.toJSON(), 'title-only'),
      (node) => nodeStyle(node).flex === 1 && nodeStyle(node).flexDirection === 'row',
    )

    expect(
      (titleOnlyMain.children ?? []).filter((child) => nodeStyle(child).flex === 1),
    ).toHaveLength(1)
    expect(valueOnlyFlexChildren).toHaveLength(1)
    expect(titleValueFlexChildren).toHaveLength(2)
    expect(nodeStyle(valueOnlyFlexChildren[0])).toMatchObject({ flex: 1, minWidth: 0 })
    expect(nodeStyle(valueOnlyFlexChildren[0]).minWidth).toBe(0)
  })

  it('keeps the label spacing in title and label combinations', async () => {
    await render(
      <ConfigProvider>
        <Cell title="标题" label="辅助说明" value="值" />
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
        extra={
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
        extra={<Text testID="extra">操作</Text>}
      />,
    )

    expect(screen.getByTestId('title-extra')).toBeTruthy()
    expect(screen.getByTestId('value-extra')).toBeTruthy()
    expect(screen.getByTestId('extra')).toBeTruthy()
  })

  it('changes only Main direction in vertical mode and keeps trailing content horizontal', async () => {
    const view = await render(
      <Cell
        testID="vertical"
        vertical
        title="标题"
        value="值"
        extra={<Text testID="vertical-extra">操作</Text>}
        isLink
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

  it('keeps extra at the top of a vertical row by default and centers it with center', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="default-extra" vertical title="标题" value="这是一段多行值" extra="操作" />
        <Cell
          testID="centered-extra"
          vertical
          center
          title="标题"
          value="这是一段多行值"
          extra={<Text testID="centered-extra-node">操作</Text>}
        />
      </ConfigProvider>,
    )

    const defaultExtraContainer = findNode(
      cellNode(view.toJSON(), 'default-extra'),
      (node) => nodeStyle(node).flexShrink === 1 && nodeStyle(node).marginLeft !== undefined,
    )
    const centeredExtraContainer = findNode(
      cellNode(view.toJSON(), 'centered-extra'),
      (node) => nodeStyle(node).flexShrink === 1 && nodeStyle(node).marginLeft !== undefined,
    )

    expect(nodeStyle(defaultExtraContainer).justifyContent).toBe('flex-start')
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
    expect(StyleSheet.flatten(screen.getByText('*').parent?.props.style)).toMatchObject({
      flexDirection: 'row',
    })
  })

  it('keeps value content top-aligned by default and centers it with center', async () => {
    const view = await render(
      <ConfigProvider>
        <Cell testID="default" title="标题" label="辅助说明" value="值" />
        <Cell testID="center" title="标题" label="辅助说明" value="值" center />
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
    const resolved = getCellStyles(token, { isLink: true }, { pressed: false, disabled: false })

    expect(resolved.suffix).toMatchObject({ height: token.lineHeight })
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

  it('makes isLink clickable by default while allowing explicit clickable={false}', async () => {
    await render(
      <ConfigProvider>
        <Cell testID="link" title="链接" isLink />
        <Cell testID="not-clickable" title="静态链接" isLink clickable={false} />
        <Cell testID="explicit-clickable" title="可点击" clickable />
      </ConfigProvider>,
    )
    const activeColor = getCellToken(getDesignToken()).activeColor

    expect(screen.getByTestId('link').props.accessibilityRole).toBe('button')
    expect(
      getCellStyles(
        getCellToken(getDesignToken()),
        { isLink: true },
        { pressed: true, disabled: false },
      ).root.backgroundColor,
    ).toBe(activeColor)
    expect(
      getCellStyles(
        getCellToken(getDesignToken()),
        { isLink: true, clickable: false },
        { pressed: true, disabled: false },
      ).root.backgroundColor,
    ).not.toBe(activeColor)
    expect(
      getCellStyles(
        getCellToken(getDesignToken()),
        { clickable: true },
        { pressed: true, disabled: false },
      ).root.backgroundColor,
    ).toBe(activeColor)
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
        <Cell testID="themed-cell" title="主题分割线" />
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
  })
})
