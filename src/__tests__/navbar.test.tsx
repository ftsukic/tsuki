import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { getDesignToken, Navbar, Pressable } from '..'
import { getNavbarToken } from '../navbar/token'
import type { NavbarProps, NavbarStyleInfo } from '../navbar/types'

jest.mock('../icon', () => {
  const React = jest.requireActual('react')
  const { Text: NativeText } = jest.requireActual('react-native')

  return {
    Icon: ({ name, size, style }: { name: string; size?: number; style?: unknown }) =>
      React.createElement(NativeText, { testID: `icon-${name}`, size, style }),
  }
})

const validNavbarTextProps: Pick<NavbarProps, 'leftText' | 'rightText'> = {
  leftText: '返回',
  rightText: '完成',
}

// @ts-expect-error Navbar leftText only accepts string.
const invalidNavbarLeftTextProps: Pick<NavbarProps, 'leftText'> = { leftText: <Text>返回</Text> }

// @ts-expect-error Navbar rightText only accepts string.
const invalidNavbarRightTextProps: Pick<NavbarProps, 'rightText'> = { rightText: <Text>完成</Text> }

void validNavbarTextProps
void invalidNavbarLeftTextProps
void invalidNavbarRightTextProps

function flattenStyle(testID: string, pressed = false) {
  const style = screen.getByTestId(testID).props.style
  return StyleSheet.flatten(typeof style === 'function' ? style({ pressed }) : style)
}

async function press(testID: string) {
  fireEvent.press(screen.getByTestId(testID))
  await Promise.resolve()
}

describe('Navbar', () => {
  it('defaults to no left arrow and omits empty slots', async () => {
    const token = getNavbarToken(getDesignToken())

    await render(<Navbar testID="navbar" title="标题" />)

    expect(screen.queryByTestId('icon-LeftOutlined')).toBeNull()
    expect(screen.queryByTestId('navbar-left')).toBeNull()
    expect(screen.queryByTestId('navbar-right')).toBeNull()
    expect(flattenStyle('navbar-bar')).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      height: token.height,
      position: 'relative',
    })
    expect(flattenStyle('navbar-bar')).not.toHaveProperty('justifyContent', 'center')
    expect(flattenStyle('navbar-title')).toMatchObject({
      alignItems: 'center',
      flexShrink: 1,
      justifyContent: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: '60%',
      overflow: 'hidden',
    })
    expect(flattenStyle('navbar-title')).not.toHaveProperty('position')
    expect(screen.getByTestId('navbar-title').props.pointerEvents).toBe('none')
    expect(screen.getByText('标题').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })
    expect(StyleSheet.flatten(screen.getByText('标题').props.style)).toMatchObject({
      fontWeight: '600',
      lineHeight: getDesignToken().lineHeightLG,
    })
    expect(screen.queryByTestId('navbar-title-wrapper')).toBeNull()
    expect(StyleSheet.flatten(screen.getByText('标题').props.style)).not.toHaveProperty('maxWidth')
  })

  it('renders provided slots without creating a title node when title is absent', async () => {
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
    expect(screen.queryByTestId('navbar-title')).toBeNull()
    expect(screen.queryByText('标题')).toBeNull()
  })

  it('does not create empty slots for slot callbacks', async () => {
    const onPressLeft = jest.fn()
    const onPressRight = jest.fn()

    await render(
      <Navbar testID="navbar" title="标题" onPressLeft={onPressLeft} onPressRight={onPressRight} />,
    )

    expect(screen.queryByTestId('navbar-left')).toBeNull()
    expect(screen.queryByTestId('navbar-right')).toBeNull()
  })

  it('does not create empty slots for disabled props', async () => {
    await render(<Navbar testID="navbar" title="标题" leftDisabled rightDisabled />)

    expect(screen.queryByTestId('navbar-left')).toBeNull()
    expect(screen.queryByTestId('navbar-right')).toBeNull()
  })

  it('renders only the slots that have default content', async () => {
    await render(
      <>
        <Navbar testID="left-only" leftText="返回" />
        <Navbar testID="right-only" rightText="完成" />
      </>,
    )

    expect(screen.getByTestId('left-only-left')).toBeTruthy()
    expect(screen.queryByTestId('left-only-right')).toBeNull()
    expect(screen.queryByTestId('right-only-left')).toBeNull()
    expect(screen.getByTestId('right-only-right')).toBeTruthy()
    expect(flattenStyle('left-only-left')).not.toHaveProperty('justifyContent', 'center')
    expect(flattenStyle('right-only-right')).not.toHaveProperty('justifyContent', 'center')
  })

  it('renders leftText as Navbar-owned single-line Text', async () => {
    await render(<Navbar testID="navbar" leftText="返回" />)

    expect(screen.getByTestId('navbar-left')).toBeTruthy()
    expect(screen.getByText('返回').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })
  })

  it('renders the left arrow and text as direct left slot children', async () => {
    await render(<Navbar testID="navbar" leftArrow leftText="返回" />)

    const leftSlot = screen.getByTestId('navbar-left')
    expect(leftSlot.children).toHaveLength(2)
    expect(leftSlot.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          props: expect.objectContaining({ testID: 'icon-LeftOutlined' }),
        }),
        expect.objectContaining({ props: expect.objectContaining({ children: '返回' }) }),
      ]),
    )
    expect(screen.getByTestId('icon-LeftOutlined').props.style).toEqual({
      marginRight: getDesignToken().paddingXXS,
    })
  })

  it('renders only the arrow when leftArrow is enabled without leftText', async () => {
    await render(<Navbar testID="navbar" leftArrow />)

    const leftSlot = screen.getByTestId('navbar-left')
    expect(leftSlot.children).toHaveLength(1)
    expect(screen.getByTestId('icon-LeftOutlined')).toBeTruthy()
    expect(screen.queryByText('返回')).toBeNull()
  })

  it('lets custom left content override the built-in arrow and text', async () => {
    await render(
      <Navbar testID="navbar" left={<View testID="custom" />} leftArrow leftText="返回" />,
    )

    expect(screen.getByTestId('custom')).toBeTruthy()
    expect(screen.queryByTestId('icon-LeftOutlined')).toBeNull()
    expect(screen.queryByText('返回')).toBeNull()
  })

  it('renders rightText as Navbar-owned Text and lets custom right override it', async () => {
    const { rerender } = await render(<Navbar testID="navbar" rightText="完成" />)

    expect(screen.getByText('完成').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    })

    await rerender(
      <Navbar testID="navbar" right={<View testID="custom-right" />} rightText="完成" />,
    )

    expect(screen.getByTestId('custom-right')).toBeTruthy()
    expect(screen.queryByText('完成')).toBeNull()
  })

  it('renders custom left and right nodes directly when no slot callback is provided', async () => {
    const onAdd = jest.fn()
    const onMore = jest.fn()

    await render(
      <Navbar
        testID="navbar"
        left={
          <View testID="custom-left">
            <Pressable testID="back" onPress={() => undefined}>
              <Text>返回</Text>
            </Pressable>
            <Pressable testID="group" onPress={() => undefined}>
              <Text>信息部（17）</Text>
            </Pressable>
          </View>
        }
        right={
          <View testID="custom-right" style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable testID="add" onPress={onAdd}>
              <Text>+</Text>
            </Pressable>
            <Pressable testID="more" onPress={onMore}>
              <Text>...</Text>
            </Pressable>
          </View>
        }
      />,
    )

    expect(screen.getByTestId('custom-left')).toBeTruthy()
    expect(screen.getByTestId('custom-right')).toBeTruthy()
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBeUndefined()
    expect(screen.getByTestId('navbar-right').props.accessibilityRole).toBeUndefined()

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

    await press('navbar-left')
    await press('navbar-right')

    expect(onPressLeft).toHaveBeenCalledTimes(1)
    expect(onPressRight).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('navbar-right').props.accessibilityRole).toBe('button')
  })

  it('renders default left and right content through the clickable slot hosts', async () => {
    const token = getNavbarToken(getDesignToken())
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

    await press('navbar-left')
    await press('navbar-right')

    expect(onPressLeft).toHaveBeenCalledTimes(1)
    expect(onPressRight).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('navbar-right').props.accessibilityRole).toBe('button')
    expect(flattenStyle('navbar-left')).toMatchObject({
      paddingHorizontal: token.paddingHorizontal,
    })
    expect(flattenStyle('navbar-right')).toMatchObject({
      paddingHorizontal: token.paddingHorizontal,
    })
    expect(screen.queryByTestId('navbar-left-action')).toBeNull()
    expect(screen.queryByTestId('navbar-right-action')).toBeNull()
  })

  it('keeps disabled left and right slots rendered but not pressable', async () => {
    const onPressLeft = jest.fn()
    const onPressRight = jest.fn()

    await render(
      <Navbar
        testID="navbar"
        leftText="返回"
        leftDisabled
        onPressLeft={onPressLeft}
        rightText="完成"
        rightDisabled
        onPressRight={onPressRight}
      />,
    )

    await press('navbar-left')
    await press('navbar-right')

    expect(onPressLeft).not.toHaveBeenCalled()
    expect(onPressRight).not.toHaveBeenCalled()
    expect(screen.getByTestId('navbar-left').props.accessibilityState?.disabled).toBe(true)
    expect(screen.getByTestId('navbar-right').props.accessibilityState?.disabled).toBe(true)
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('navbar-right').props.accessibilityRole).toBe('button')
  })

  it('renders the built-in left arrow only when enabled', async () => {
    await render(
      <Navbar testID="navbar" title="标题" leftArrow leftIconSize={20} leftText="返回" />,
    )

    expect(screen.getByTestId('icon-LeftOutlined').props.size).toBe(20)
    expect(screen.getByText('返回')).toBeTruthy()
    expect(flattenStyle('navbar-left')).toMatchObject({ paddingHorizontal: 16 })
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBeUndefined()
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
    expect(flattenStyle('navbar-left')).not.toHaveProperty('maxWidth')
    expect(flattenStyle('navbar-right')).not.toHaveProperty('maxWidth')
    expect(
      StyleSheet.flatten(screen.getByText('这是一个很长的导航标题').props.style),
    ).toMatchObject({ lineHeight: getDesignToken().lineHeightLG })
    expect(flattenStyle('navbar-title')).toMatchObject({
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: '60%',
      overflow: 'hidden',
    })
  })

  it('keeps custom slot layout identical with or without a slot callback', async () => {
    const token = getNavbarToken(getDesignToken())
    const onPressLeft = jest.fn()
    const onPressRight = jest.fn()
    const leftContent = <View testID="custom-left" style={{ height: 24, width: 48 }} />
    const rightContent = <View testID="custom-right" style={{ height: 24, width: 56 }} />

    const { rerender } = await render(
      <Navbar testID="navbar" left={leftContent} right={rightContent} />,
    )

    const leftSlotStyle = flattenStyle('navbar-left')
    const rightSlotStyle = flattenStyle('navbar-right')
    const leftNodeStyle = StyleSheet.flatten(screen.getByTestId('custom-left').props.style)
    const rightNodeStyle = StyleSheet.flatten(screen.getByTestId('custom-right').props.style)

    expect(leftSlotStyle).toMatchObject({
      paddingHorizontal: token.paddingHorizontal,
    })
    expect(rightSlotStyle).toMatchObject({
      paddingHorizontal: token.paddingHorizontal,
    })
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBeUndefined()
    expect(screen.getByTestId('navbar-right').props.accessibilityRole).toBeUndefined()

    await rerender(
      <Navbar
        testID="navbar"
        left={<View testID="custom-left" style={{ height: 24, width: 48 }} />}
        onPressLeft={onPressLeft}
        right={<View testID="custom-right" style={{ height: 24, width: 56 }} />}
        onPressRight={onPressRight}
      />,
    )

    expect(flattenStyle('navbar-left')).toMatchObject(leftSlotStyle)
    expect(flattenStyle('navbar-right')).toMatchObject(rightSlotStyle)
    expect(StyleSheet.flatten(screen.getByTestId('custom-left').props.style)).toEqual(leftNodeStyle)
    expect(StyleSheet.flatten(screen.getByTestId('custom-right').props.style)).toEqual(
      rightNodeStyle,
    )
    expect(flattenStyle('navbar-left')).toMatchObject({
      paddingHorizontal: token.paddingHorizontal,
    })
    expect(flattenStyle('navbar-right')).toMatchObject({
      paddingHorizontal: token.paddingHorizontal,
    })
    expect(screen.getByTestId('navbar-left').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('navbar-right').props.accessibilityRole).toBe('button')

    await press('navbar-left')
    await press('navbar-right')
    expect(onPressLeft).toHaveBeenCalledTimes(1)
    expect(onPressRight).toHaveBeenCalledTimes(1)
  })

  it('supports a custom ReactNode title in the normal-flow title slot', async () => {
    await render(
      <Navbar
        testID="navbar"
        title={<Text testID="custom-title">群组信息</Text>}
        left={
          <Pressable>
            <Text>返回</Text>
          </Pressable>
        }
      />,
    )

    expect(screen.getByTestId('custom-title')).toBeTruthy()
    expect(screen.getByTestId('navbar-title').props.pointerEvents).toBe('none')
    expect(flattenStyle('navbar-title')).toMatchObject({
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: '60%',
      overflow: 'hidden',
    })
    expect(screen.queryByTestId('navbar-title-wrapper')).toBeNull()
  })

  it('applies styles.title to the title container', async () => {
    await render(
      <Navbar
        testID="navbar"
        title="标题"
        styles={{ title: { marginLeft: 24, maxWidth: '80%' } }}
      />,
    )

    expect(flattenStyle('navbar-title')).toMatchObject({ marginLeft: 24, maxWidth: '80%' })
    expect(StyleSheet.flatten(screen.getByText('标题').props.style)).not.toHaveProperty(
      'marginLeft',
    )
    expect(StyleSheet.flatten(screen.getByText('标题').props.style)).not.toHaveProperty('maxWidth')
  })

  it('applies styles.titleText only to a string title', async () => {
    await render(
      <Navbar
        testID="navbar"
        title="标题"
        styles={{ titleText: { fontSize: 18, textAlign: 'left' } }}
      />,
    )

    expect(StyleSheet.flatten(screen.getByText('标题').props.style)).toMatchObject({
      fontSize: 18,
      textAlign: 'left',
    })
    expect(flattenStyle('navbar-title')).toMatchObject({ maxWidth: '60%' })
  })

  it('keeps titleText styles away from custom title nodes', async () => {
    await render(
      <Navbar
        testID="navbar"
        title={<View testID="custom-title" />}
        styles={{ title: { maxWidth: '80%' }, titleText: { fontSize: 30 } }}
      />,
    )

    expect(screen.getByTestId('custom-title').props.style).toBeUndefined()
    expect(flattenStyle('navbar-title')).toMatchObject({ maxWidth: '80%' })
  })

  it('passes independent disabled state to the semantic style resolver', async () => {
    const styles = jest.fn(({ state }: NavbarStyleInfo) => ({
      left: { opacity: state.leftDisabled ? 0.5 : 1 },
      right: { opacity: state.rightDisabled ? 0.5 : 1 },
    }))

    await render(
      <Navbar testID="navbar" leftText="返回" rightText="完成" leftDisabled styles={styles} />,
    )

    expect(styles).toHaveBeenCalledWith(
      expect.objectContaining({
        state: { leftDisabled: true, rightDisabled: false },
      }),
    )
    expect(styles.mock.calls[0][0].state).not.toHaveProperty('pressed')
    expect(flattenStyle('navbar-left')).toMatchObject({ opacity: 0.5 })
    expect(flattenStyle('navbar-right')).toMatchObject({ opacity: 1 })
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
})
