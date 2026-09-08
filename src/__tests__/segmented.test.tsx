import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { Animated, StyleSheet } from 'react-native'
import { getButtonToken } from '../button/token'
import { getSegmentedStyles } from '../segmented/style'
import { ConfigProvider, Segmented, getDesignToken, getSegmentedToken } from '..'

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

async function measure(index: number, x: number, width: number): Promise<void> {
  await act(async () => {
    screen.getAllByRole('radio')[index].props.onLayout({
      nativeEvent: { layout: { x, width } },
    })
  })
}

describe('Segmented', () => {
  it('derives an antd-style track and selected thumb from theme tokens', () => {
    const token = getDesignToken()

    expect(getSegmentedToken(token)).toEqual({
      activeBackgroundColor: token.colorBgContainer,
      activeColor: token.colorText,
      backgroundColor: token.colorFillTertiary,
      borderColor: token.colorBorder,
      borderWidth: token.lineWidth,
      disabledColor: token.colorTextDisabled,
      animationDuration: token.motionDurationMid,
      padding: token.paddingXXS,
      fontFamily: token.fontFamily,
    })
  })

  it('normalizes options and changes value across the full pressable item', async () => {
    const onChange = jest.fn()

    await render(
      <Segmented
        testID="segmented"
        defaultValue="read"
        onChange={onChange}
        options={['unread', { label: '已读通知', value: 'read' }, { label: '数字', value: 2 }]}
      />,
    )

    expect(screen.getByTestId('segmented').props.accessibilityRole).toBe('radiogroup')
    expect(
      screen.getAllByRole('radio').find((radio) => radio.props.accessibilityState?.selected)?.props
        .accessibilityState?.selected,
    ).toBe(true)
    expect(screen.getAllByRole('radio')[0].props.pointerEvents).not.toBe('none')

    await press(screen.getAllByRole('radio')[0])
    expect(onChange).toHaveBeenCalledWith('unread')
    expect(screen.getAllByRole('radio')[0].props.accessibilityState?.selected).toBe(true)
  })

  it('selects the first enabled option and blocks disabled options and controls', async () => {
    const onChange = jest.fn()

    await render(
      <>
        <Segmented
          testID="options"
          onChange={onChange}
          options={[
            { label: '禁用', value: 'disabled', disabled: true },
            { label: '可用', value: 'enabled' },
          ]}
        />
        <Segmented testID="all-disabled" disabled options={['one', 'two']} />
      </>,
    )

    const radios = screen.getAllByRole('radio')
    expect(radios[1].props.accessibilityState?.selected).toBe(true)
    await press(radios[0])
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('all-disabled').props.accessibilityState?.disabled).toBe(true)
  })

  it('keeps the active item transparent and uses semantic styles for the label', async () => {
    const token = getDesignToken()

    await render(
      <ConfigProvider
        theme={{
          token: { colorPrimary: '#0958d9' },
          components: { Button: { heightLG: 60 } },
        }}
      >
        <Segmented
          defaultValue="all"
          size="large"
          styles={({ state }) => ({
            label: { fontWeight: state.value === 'all' ? '600' : '400' },
            root: { marginTop: state.size === 'large' ? 4 : 2 },
          })}
          options={['all', 'unread']}
        />
      </ConfigProvider>,
    )

    const activeItemStyle = StyleSheet.flatten(screen.getAllByRole('radio')[0].props.style)
    const labelStyle = StyleSheet.flatten(screen.getByText('all').props.style)

    expect(activeItemStyle.backgroundColor).toBeUndefined()
    expect(labelStyle).toMatchObject({ color: token.colorText, fontWeight: '600', fontSize: 16 })
  })

  it('applies radius only to the container and thumb', async () => {
    await render(
      <>
        <Segmented testID="default" shape="default" options={['first', 'middle', 'last']} />
        <Segmented testID="round" shape="round" options={['first', 'middle', 'last']} />
      </>,
    )

    const defaultRoot = StyleSheet.flatten(screen.getByTestId('default').props.style)
    const roundRoot = StyleSheet.flatten(screen.getByTestId('round').props.style)
    expect(defaultRoot).toMatchObject({
      backgroundColor: getDesignToken().colorFillTertiary,
      borderColor: getDesignToken().colorBorder,
      borderWidth: getDesignToken().lineWidth,
      borderRadius: getDesignToken().borderRadius,
    })
    expect(roundRoot.borderRadius).toBe(999)

    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      const itemStyle = StyleSheet.flatten(radio.props.style)
      expect(itemStyle.borderRadius).toBeUndefined()
      expect(itemStyle.borderTopLeftRadius).toBeUndefined()
      expect(itemStyle.borderTopRightRadius).toBeUndefined()
      expect(itemStyle.borderBottomLeftRadius).toBeUndefined()
      expect(itemStyle.borderBottomRightRadius).toBeUndefined()
    }

    await act(async () => {
      radios[3].props.onLayout({ nativeEvent: { layout: { x: 0, width: 80 } } })
    })
    expect(
      StyleSheet.flatten(screen.getAllByTestId('segmented-thumb')[0].props.style),
    ).toMatchObject({
      backgroundColor: getDesignToken().colorBgContainer,
      borderRadius: 999,
    })
    expect(screen.getAllByTestId('segmented-thumb')[0].props.pointerEvents).toBe('none')
  })

  it('uses the thumb radius for pressed feedback', () => {
    const token = getDesignToken()
    const defaultStyles = getSegmentedStyles(
      token,
      getButtonToken(token),
      getSegmentedToken(token),
      'default',
      false,
      false,
    )
    const roundStyles = getSegmentedStyles(
      token,
      getButtonToken(token),
      getSegmentedToken(token),
      'round',
      false,
      false,
    )

    expect(defaultStyles.pressedOverlay).toMatchObject({
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: token.borderRadius,
    })
    expect(roundStyles.pressedOverlay.borderRadius).toBe(999)
  })

  it('animates both thumb position and width when the selected item changes', async () => {
    const timing = jest.spyOn(Animated, 'timing').mockImplementation(() => {
      return {
        reset: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      } as unknown as Animated.CompositeAnimation
    })

    await render(
      <Segmented
        defaultValue="one"
        options={[
          { label: '一', value: 'one' },
          { label: '更长的第二项', value: 'two' },
          { label: '第三项', value: 'three' },
        ]}
      />,
    )

    await measure(0, 0, 48)
    await measure(1, 48, 120)
    await measure(2, 168, 72)
    timing.mockClear()

    await press(screen.getAllByRole('radio')[1])

    expect(timing).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({
        duration: getDesignToken().motionDurationMid,
        easing: expect.any(Function),
        toValue: 48,
        useNativeDriver: false,
      }),
    )
    expect(timing).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        duration: getDesignToken().motionDurationMid,
        easing: expect.any(Function),
        toValue: 120,
        useNativeDriver: false,
      }),
    )

    timing.mockClear()
    await press(screen.getAllByRole('radio')[2])

    expect(timing).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({ toValue: 168, useNativeDriver: false }),
    )
    expect(timing).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({ toValue: 72, useNativeDriver: false }),
    )

    timing.mockRestore()
  })

  it('does not animate a disabled control', async () => {
    const timing = jest.spyOn(Animated, 'timing')

    await render(<Segmented disabled options={['one', 'two']} />)
    await measure(0, 0, 60)
    await measure(1, 60, 90)
    timing.mockClear()

    await press(screen.getAllByRole('radio')[1])

    expect(timing).not.toHaveBeenCalled()
    timing.mockRestore()
  })
})
