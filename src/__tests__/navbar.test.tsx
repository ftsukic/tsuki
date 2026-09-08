import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { getDesignToken, getNavbarToken, Navbar, NavbarAction } from '..'

jest.mock('../icon', () => {
  const React = jest.requireActual('react')
  const { Text } = jest.requireActual('react-native')

  return {
    Icon: ({ name }: { name: string }) => React.createElement(Text, { testID: `icon-${name}` }),
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
  it('keeps the title centered independently of left and right widths', async () => {
    const token = getNavbarToken(getDesignToken())
    const { rerender } = await render(
      <Navbar testID="navbar" title="标题" leftText="返回" rightText="完成" />,
    )

    expect(flattenStyle('navbar-title')).toMatchObject({
      flexShrink: 1,
      marginHorizontal: 'auto',
      maxWidth: '60%',
      overflow: 'hidden',
    })
    expect(screen.getByText('标题').props.numberOfLines).toBe(1)
    expect(flattenStyle('navbar-bar')).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      height: token.height,
      position: 'relative',
      justifyContent: 'center',
    })

    const shortLeft = flattenStyle('navbar-left')
    const shortRight = flattenStyle('navbar-right')

    await rerender(
      <Navbar
        testID="navbar"
        title="这是一个很长的标题，用来验证标题仍然位于导航栏中心"
        leftText="返回上一级页面"
        rightText="保存并继续"
      />,
    )

    expect(flattenStyle('navbar-title')).toMatchObject({ maxWidth: '60%' })
    expect(flattenStyle('navbar-left')).toMatchObject({ left: shortLeft.left })
    expect(flattenStyle('navbar-right')).toMatchObject({ right: shortRight.right })
  })

  it('routes left and right presses through NavbarAction', async () => {
    const onPressLeft = jest.fn()
    const onPressRight = jest.fn()

    await render(
      <Navbar
        testID="navbar"
        title="标题"
        onPressLeft={onPressLeft}
        onPressRight={onPressRight}
        rightText="完成"
      />,
    )

    await press('navbar-left')
    await press('navbar-right')

    expect(onPressLeft).toHaveBeenCalledTimes(1)
    expect(onPressRight).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('navbar-right').props.accessibilityRole).toBe('button')
  })

  it('uses the same horizontal padding for variable-width actions', async () => {
    const token = getNavbarToken(getDesignToken())

    await render(
      <Navbar
        testID="navbar"
        title="标题"
        leftText="这是一个很长的返回文字"
        rightText="这是一个很长的右侧操作"
      />,
    )

    expect(flattenStyle('navbar-left')).toMatchObject({
      position: 'absolute',
      left: 0,
      maxWidth: '20%',
      paddingHorizontal: token.paddingHorizontal,
    })
    expect(flattenStyle('navbar-right')).toMatchObject({
      position: 'absolute',
      maxWidth: '20%',
      paddingHorizontal: token.paddingHorizontal,
      right: 0,
    })
  })

  it('keeps the default back arrow and text in one horizontal content row', async () => {
    await render(<Navbar testID="navbar" title="标题" leftText="返回" />)

    expect(screen.getByTestId('icon-LeftOutlined')).toBeTruthy()
    expect(screen.getByText('返回')).toBeTruthy()
    expect(flattenStyle('navbar-left')).toMatchObject({ flexDirection: 'row' })
  })

  it('limits text actions to one line with tail ellipsis', async () => {
    await render(<Navbar testID="navbar" title="标题" rightText="保存并继续下一步" />)

    expect(screen.getByText('保存并继续下一步').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })
    expect(flattenStyle('navbar-right')).toMatchObject({ flexShrink: 1, maxWidth: '20%' })
  })

  it('renders or omits the bottom border', async () => {
    const { rerender } = await render(<Navbar testID="navbar" title="有分割线" />)
    expect(screen.getByTestId('navbar-divider')).toBeTruthy()

    await rerender(<Navbar testID="navbar" title="无分割线" border={false} />)
    expect(screen.queryByTestId('navbar-divider')).toBeNull()
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
