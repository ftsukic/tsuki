import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { getDesignToken, Navbar, NavbarAction } from '..'
import { getNavbarToken } from '../navbar/token'

jest.mock('../icon', () => {
  const React = jest.requireActual('react')
  const { Text: NativeText } = jest.requireActual('react-native')

  return {
    Icon: ({ name, size }: { name: string; size?: number }) =>
      React.createElement(NativeText, { testID: `icon-${name}`, size }),
  }
})

function flattenStyle(testID: string, pressed = false) {
  const style = screen.getByTestId(testID).props.style
  return StyleSheet.flatten(typeof style === 'function' ? style({ pressed }) : style)
}

async function press(testID: string) {
  fireEvent.press(screen.getByTestId(testID))
  await Promise.resolve()
}

describe('Navbar', () => {
  it('defaults to no left arrow and always uses the fixed three-slot layout', async () => {
    const token = getNavbarToken(getDesignToken())

    await render(<Navbar testID="navbar" title="标题" />)

    expect(screen.queryByTestId('icon-LeftOutlined')).toBeNull()
    expect(flattenStyle('navbar-bar')).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      height: token.height,
      position: 'relative',
    })
    expect(flattenStyle('navbar-left')).toMatchObject({
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      maxWidth: '20%',
    })
    expect(flattenStyle('navbar-right')).toMatchObject({
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      maxWidth: '20%',
    })
    expect(flattenStyle('navbar-title')).toMatchObject({
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    })
    expect(screen.getByTestId('navbar-title').props.pointerEvents).toBe('none')
    expect(screen.getByText('标题').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })
    expect(StyleSheet.flatten(screen.getByText('标题').props.style)).toMatchObject({
      fontWeight: '600',
      maxWidth: '60%',
    })
  })

  it('keeps the three slots when title is absent', async () => {
    await render(
      <Navbar
        testID="navbar"
        title={null}
        left={<View testID="custom-left" />}
        right={<View testID="custom-right" />}
      />,
    )

    expect(flattenStyle('navbar-bar')).not.toHaveProperty('justifyContent', 'space-between')
    expect(flattenStyle('navbar-left')).toMatchObject({ position: 'absolute', left: 0 })
    expect(flattenStyle('navbar-right')).toMatchObject({ position: 'absolute', right: 0 })
    expect(screen.getByTestId('navbar-title')).toBeTruthy()
    expect(screen.queryByText('标题')).toBeNull()
  })

  it('renders custom left and right nodes directly when no slot callback is provided', async () => {
    const onAdd = jest.fn()
    const onMore = jest.fn()

    await render(
      <Navbar
        testID="navbar"
        left={
          <View testID="custom-left">
            <NavbarAction testID="back" onPress={() => undefined}>
              返回
            </NavbarAction>
            <NavbarAction testID="group" onPress={() => undefined}>
              信息部（17）
            </NavbarAction>
          </View>
        }
        right={
          <View testID="custom-right" style={{ flexDirection: 'row', gap: 16 }}>
            <NavbarAction testID="add" onPress={onAdd}>
              +
            </NavbarAction>
            <NavbarAction testID="more" onPress={onMore}>
              ...
            </NavbarAction>
          </View>
        }
      />,
    )

    expect(screen.getByTestId('custom-left')).toBeTruthy()
    expect(screen.getByTestId('custom-right')).toBeTruthy()
    expect(screen.queryByTestId('navbar-left-action')).toBeNull()
    expect(screen.queryByTestId('navbar-right-action')).toBeNull()

    await press('add')
    await press('more')
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onMore).toHaveBeenCalledTimes(1)
  })

  it('keeps slot-level callbacks when custom left and right content is provided', async () => {
    const onPressLeft = jest.fn()
    const onPressRight = jest.fn()

    await render(
      <Navbar
        testID="navbar"
        left={<View testID="custom-left" />}
        onPressLeft={onPressLeft}
        right={<View testID="custom-right" />}
        onPressRight={onPressRight}
      />,
    )

    await press('navbar-left-action')
    await press('navbar-right-action')

    expect(onPressLeft).toHaveBeenCalledTimes(1)
    expect(onPressRight).toHaveBeenCalledTimes(1)
  })

  it('routes default left and right content through NavbarAction', async () => {
    const onPressLeft = jest.fn()
    const onPressRight = jest.fn()

    await render(
      <Navbar
        testID="navbar"
        title="标题"
        leftText="返回"
        onPressLeft={onPressLeft}
        rightText="完成"
        onPressRight={onPressRight}
      />,
    )

    await press('navbar-left-action')
    await press('navbar-right-action')

    expect(onPressLeft).toHaveBeenCalledTimes(1)
    expect(onPressRight).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('navbar-left-action').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('navbar-right-action').props.accessibilityRole).toBe('button')
    expect(flattenStyle('navbar-left-action')).toMatchObject({ flexDirection: 'row' })
  })

  it('renders the built-in left arrow only when enabled', async () => {
    await render(
      <Navbar testID="navbar" title="标题" leftArrow leftIconSize={20} leftText="返回" />,
    )

    expect(screen.getByTestId('icon-LeftOutlined').props.size).toBe(20)
    expect(screen.getByText('返回')).toBeTruthy()
    expect(flattenStyle('navbar-left-action')).toMatchObject({ flexDirection: 'row' })
  })

  it('keeps string actions and titles on one line with tail ellipsis', async () => {
    await render(
      <Navbar
        testID="navbar"
        title="这是一个很长的导航标题"
        leftText="返回订单列表并继续浏览"
        rightText="保存并继续下一步"
      />,
    )

    expect(screen.getByText('返回订单列表并继续浏览').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })
    expect(screen.getByText('保存并继续下一步').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })
    expect(screen.getByText('这是一个很长的导航标题').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })
    expect(flattenStyle('navbar-left')).toHaveProperty('maxWidth', '20%')
    expect(flattenStyle('navbar-right')).toHaveProperty('maxWidth', '20%')
    expect(
      StyleSheet.flatten(screen.getByText('这是一个很长的导航标题').props.style),
    ).toHaveProperty('maxWidth', '60%')
  })

  it('supports a custom ReactNode title in the centered slot', async () => {
    await render(
      <Navbar
        testID="navbar"
        title={<Text testID="custom-title">群组信息</Text>}
        left={<NavbarAction>返回</NavbarAction>}
      />,
    )

    expect(screen.getByTestId('custom-title')).toBeTruthy()
    expect(screen.getByTestId('navbar-title').props.pointerEvents).toBe('none')
  })

  it('applies semantic left and right styles to fixed slots', async () => {
    await render(
      <Navbar
        testID="navbar"
        left={<View />}
        right={<View />}
        styles={{ left: { paddingLeft: 12 }, right: { paddingRight: 12 } }}
      />,
    )

    expect(flattenStyle('navbar-left')).toMatchObject({ paddingLeft: 12 })
    expect(flattenStyle('navbar-right')).toMatchObject({ paddingRight: 12 })
  })

  it('renders a bottom hairline without increasing the 46-point content height', async () => {
    const token = getNavbarToken(getDesignToken())

    await render(<Navbar testID="navbar" title="有分割线" />)

    expect(flattenStyle('navbar-bar')).toMatchObject({ height: token.height })
    expect(flattenStyle('navbar-divider')).toMatchObject({
      backgroundColor: token.borderColor,
      bottom: 0,
      height: getDesignToken().lineWidthHairline,
      left: 0,
      position: 'absolute',
      right: 0,
    })
    expect(screen.getByTestId('navbar-divider').props.pointerEvents).toBe('none')
  })

  it('uses the weak border token and can hide the hairline', async () => {
    const token = getDesignToken()
    const { rerender } = await render(<Navbar testID="navbar" title="有分割线" />)

    expect(getNavbarToken(token).borderColor).toBe(token.colorBorderSecondary)
    expect(screen.getByTestId('navbar-divider')).toBeTruthy()

    await rerender(<Navbar testID="navbar" title="无分割线" border={false} />)
    expect(screen.queryByTestId('navbar-divider')).toBeNull()
  })

  it('supports fixed positioning and zIndex on the real Navbar root', async () => {
    await render(<Navbar testID="navbar" fixed zIndex={1200} title="固定" />)

    expect(flattenStyle('navbar')).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      zIndex: 1200,
    })
    expect(screen.getByTestId('navbar')).toBeTruthy()
    expect(screen.queryByTestId('navbar-placeholder')).toBeNull()
  })

  it('adds top safe-area space without changing the Navbar content token height', async () => {
    const token = getNavbarToken(getDesignToken())

    await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 24 }}>
        <Navbar testID="with-inset" safeAreaInsetTop title="安全区" />
        <Navbar testID="without-inset" safeAreaInsetTop={false} title="无安全区" />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(flattenStyle('with-inset')).toMatchObject({ paddingTop: 24 })
    expect(flattenStyle('with-inset-bar')).toMatchObject({ height: token.height })
    expect(flattenStyle('without-inset')).not.toHaveProperty('paddingTop')
  })

  it('creates a placeholder only for fixed Navbars and matches the safe-area height', async () => {
    const token = getNavbarToken(getDesignToken())

    await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 24 }}>
        <Navbar testID="fixed" fixed placeholder safeAreaInsetTop title="固定占位" />
        <Navbar testID="flow" placeholder title="普通流" />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(flattenStyle('fixed-placeholder')).toMatchObject({ height: token.height + 24 })
    expect(screen.getByTestId('fixed-placeholder').props.pointerEvents).toBe('none')
    expect(screen.getByTestId('fixed-placeholder').props.accessible).toBe(false)
    expect(screen.queryByTestId('flow-placeholder')).toBeNull()
  })

  it('does not press a disabled NavbarAction', async () => {
    const onPress = jest.fn()
    await render(
      <NavbarAction testID="disabled-action" disabled onPress={onPress}>
        禁用
      </NavbarAction>,
    )

    await press('disabled-action')

    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByTestId('disabled-action').props.accessibilityState?.disabled).toBe(true)
  })

  it('uses opacity feedback without a pressed background on NavbarAction', async () => {
    await render(
      <NavbarAction testID="pressed-action" testOnly_pressed>
        更多
      </NavbarAction>,
    )

    const style = flattenStyle('pressed-action', true)
    expect(style).not.toHaveProperty('backgroundColor')
  })

  it('forwards pressed state to NavbarAction styles', async () => {
    const style = jest.fn(({ pressed }: { pressed: boolean }) => ({
      opacity: pressed ? 0.5 : 1,
    }))

    await render(
      <NavbarAction testID="styled-action" testOnly_pressed style={style}>
        更多
      </NavbarAction>,
    )

    expect(style).toHaveBeenCalledWith({ pressed: true })
    expect(flattenStyle('styled-action')).toMatchObject({ opacity: 0.5 })
  })
})
