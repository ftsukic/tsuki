import * as Reanimated from 'react-native-reanimated'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import type { TestInstance } from 'test-renderer'
import { StyleSheet } from 'react-native'
import {
  Collapse,
  CollapseItem,
  ConfigProvider,
  getCellToken,
  getCollapseToken,
  getDesignToken,
} from '../..'
import { getCollapseDividerStyle, getCollapseStyles } from '../style'

function findLayoutNode(root: TestInstance) {
  const pending: TestInstance[] = [root]

  while (pending.length > 0) {
    const candidate = pending.shift() as TestInstance
    if (typeof candidate.props.onLayout === 'function') return candidate

    pending.push(
      ...candidate.children.filter((child): child is TestInstance => typeof child !== 'string'),
    )
  }

  throw new Error('Collapse content layout node was not rendered')
}

function findNode(root: TestInstance, predicate: (node: TestInstance) => boolean) {
  const pending: TestInstance[] = [root]

  while (pending.length > 0) {
    const candidate = pending.shift() as TestInstance
    if (predicate(candidate)) return candidate

    pending.push(
      ...candidate.children.filter((child): child is TestInstance => typeof child !== 'string'),
    )
  }

  throw new Error('Collapse node was not rendered')
}

function findNodes(root: TestInstance, predicate: (node: TestInstance) => boolean) {
  const matches: TestInstance[] = []
  const pending: TestInstance[] = [root]

  while (pending.length > 0) {
    const candidate = pending.shift() as TestInstance
    if (predicate(candidate)) matches.push(candidate)

    pending.push(
      ...candidate.children.filter((child): child is TestInstance => typeof child !== 'string'),
    )
  }

  return matches
}

async function flushUI() {
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  })
}

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

describe('Collapse', () => {
  it('supports defaultValue and multiple expanded items', async () => {
    await render(
      <Collapse defaultValue={['first']}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )

    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(false)

    await press(screen.getByTestId('second'))
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)

    await press(screen.getByTestId('first'))
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(false)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)
  })

  it('supports controlled values without changing until the parent rerenders', async () => {
    const onChange = jest.fn()
    const view = await render(
      <Collapse value="first" onChange={onChange}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenCalledWith(['first', 'second'])
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(false)

    await view.rerender(
      <Collapse value={['first', 'second']} onChange={onChange}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)
  })

  it('replaces and closes the active item in accordion mode', async () => {
    const onChange = jest.fn()
    await render(
      <Collapse accordion defaultValue="first" onChange={onChange}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenCalledWith('second')
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(false)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(false)
  })

  it('does not toggle disabled items', async () => {
    const onChange = jest.fn()
    await render(
      <Collapse onChange={onChange}>
        <CollapseItem disabled name="disabled" testID="disabled" title="禁用项" />
      </Collapse>,
    )

    expect(screen.getByTestId('disabled').props.accessibilityState?.disabled).toBe(true)
    await press(screen.getByTestId('disabled'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('disabled').props.accessibilityState?.expanded).toBe(false)
  })

  it('supports numeric names and themed outer borders', async () => {
    const view = await render(
      <ConfigProvider theme={{ components: { Collapse: { headerHeight: 52 } } }}>
        <Collapse border testID="collapse" defaultValue={1}>
          <CollapseItem name={1} testID="numeric" title="数字项" />
        </Collapse>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('numeric').props.accessibilityState?.expanded).toBe(true)
    expect(StyleSheet.flatten(screen.getByTestId('collapse').props.style)).toMatchObject({
      borderTopWidth: expect.any(Number),
      borderBottomWidth: expect.any(Number),
    })
    expect(screen.getByTestId('collapse')).toBeTruthy()
    void view
  })

  it('derives Vant Cell geometry and adds inset item separators', async () => {
    const designToken = getDesignToken()
    const collapseToken = getCollapseToken(designToken)
    const cellToken = getCellToken(designToken)
    const styles = getCollapseStyles(collapseToken, {
      active: false,
      disabled: false,
      pressed: false,
    })
    const disabledStyles = getCollapseStyles(collapseToken, {
      active: false,
      disabled: true,
      pressed: false,
    })

    expect(collapseToken.headerHeight).toBe(cellToken.minHeight)
    expect(styles.header).toMatchObject({
      minHeight: cellToken.minHeight,
      overflow: 'hidden',
      paddingHorizontal: cellToken.paddingHorizontal,
    })
    expect(styles.title).toMatchObject({
      flexShrink: 1,
      lineHeight: cellToken.lineHeight,
    })
    expect(styles.content).toMatchObject({
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    })
    expect(disabledStyles.header.opacity).toBe(1)
    expect(disabledStyles.title.color).toBe(collapseToken.disabledColor)
    expect(getCollapseDividerStyle(collapseToken)).toMatchObject({
      height: collapseToken.borderWidth,
      left: collapseToken.paddingHorizontal,
      position: 'absolute',
      right: collapseToken.paddingHorizontal,
      top: 0,
    })

    await render(
      <Collapse testID="collapse-with-separators">
        <CollapseItem name="first" title="第一项" />
        <CollapseItem name="second" title="第二项" />
        <CollapseItem name="third" title="第三项" />
      </Collapse>,
    )

    const root = screen.getByTestId('collapse-with-separators')
    const dividerCount = findNodes(
      root,
      (node) =>
        node !== root &&
        StyleSheet.flatten(node.props.style)?.height === collapseToken.borderWidth &&
        StyleSheet.flatten(node.props.style)?.left === collapseToken.paddingHorizontal &&
        StyleSheet.flatten(node.props.style)?.right === collapseToken.paddingHorizontal,
    ).length
    expect(dividerCount).toBe(2)
  })

  it('uses Vant arrow orientation and animates height and arrow with the theme duration', async () => {
    jest.spyOn(Reanimated, 'measure').mockReturnValue(null)
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value
      })

    const view = await render(
      <Collapse testID="animated-collapse">
        <CollapseItem name="first" testID="animated-first" title="第一项">
          内容
        </CollapseItem>
      </Collapse>,
    )

    const root = screen.getByTestId('animated-collapse')
    const arrow = findNode(root, (node) => node.props.pointerEvents === 'none')
    expect(StyleSheet.flatten(arrow.props.style)?.transform).toEqual([{ rotate: '90deg' }])

    const content = findLayoutNode(root)
    await act(async () => {
      content.props.onLayout({ nativeEvent: { layout: { height: 40 } } })
    })
    await flushUI()
    timing.mockClear()

    await press(screen.getByTestId('animated-first'))
    await flushUI()

    expect(timing).toHaveBeenCalledTimes(2)
    expect(timing).toHaveBeenNthCalledWith(
      1,
      40,
      expect.objectContaining({ duration: 300, easing: expect.any(Function) }),
      expect.any(Function),
    )
    expect(timing).toHaveBeenNthCalledWith(
      2,
      1,
      expect.objectContaining({ duration: 300, easing: expect.any(Function) }),
    )

    timing.mockClear()
    await act(async () => {
      content.props.onLayout({ nativeEvent: { layout: { height: 40 } } })
    })
    await flushUI()
    expect(timing).not.toHaveBeenCalled()

    await view.unmount()
  })

  it('resolves Collapse motion to zero when the theme disables motion', async () => {
    jest.spyOn(Reanimated, 'measure').mockReturnValue(null)
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
    await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <Collapse testID="motionless-collapse">
          <CollapseItem name="first" testID="motionless-first" title="第一项">
            内容
          </CollapseItem>
        </Collapse>
      </ConfigProvider>,
    )

    const content = findLayoutNode(screen.getByTestId('motionless-collapse'))
    await act(async () => {
      content.props.onLayout({ nativeEvent: { layout: { height: 40 } } })
    })
    await flushUI()
    timing.mockClear()
    await press(screen.getByTestId('motionless-first'))
    await flushUI()

    expect(timing).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 0, easing: expect.any(Function) }),
    )
  })
})
