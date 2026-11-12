import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { BottomBar, getDesignToken } from '..'

describe('BottomBar', () => {
  it('renders a themed bottom-fixed layout container', async () => {
    await render(
      <BottomBar testID="bottom-bar" accessibilityLabel="底部操作区域">
        <Text>内容</Text>
      </BottomBar>,
    )

    const token = getDesignToken()
    const style = StyleSheet.flatten(screen.getByTestId('bottom-bar').props.style)

    expect(style).toMatchObject({
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.paddingSM,
      paddingHorizontal: token.padding,
      paddingTop: token.paddingSM,
      paddingBottom: token.paddingSM,
      backgroundColor: token.colorBgContainer,
      borderTopColor: token.colorBorder,
      borderTopWidth: token.lineWidthHairline,
    })
    expect(screen.getByTestId('bottom-bar').props.accessibilityLabel).toBe('底部操作区域')
    expect(screen.getByText('内容')).toBeTruthy()
  })

  it('adds the bottom safe-area inset by default and supports disabling it', async () => {
    const token = getDesignToken()

    await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 0 }}>
        <BottomBar testID="with-inset" />
        <BottomBar testID="without-inset" safeAreaInsetBottom={false} />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('with-inset').props.style)).toMatchObject({
      paddingBottom: token.paddingSM + 12,
    })
    expect(StyleSheet.flatten(screen.getByTestId('without-inset').props.style)).toMatchObject({
      paddingBottom: token.paddingSM,
    })
  })

  it('allows root style overrides without changing child ownership', async () => {
    await render(
      <BottomBar testID="custom" style={{ backgroundColor: '#102a43', paddingHorizontal: 8 }}>
        <Text testID="child">任意 children</Text>
      </BottomBar>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('custom').props.style)).toMatchObject({
      backgroundColor: '#102a43',
      paddingHorizontal: 8,
    })
    expect(screen.getByTestId('child')).toBeTruthy()
  })
})
