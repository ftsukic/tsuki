import * as Reanimated from 'react-native-reanimated'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
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
      selectedBackgroundColor: token.colorBgContainer,
      selectedTextColor: token.colorText,
      pressedBackgroundColor: token.pressedBackgroundColor,
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

  it('applies selectedTextColor to the active item without changing inactive labels', async () => {
    const themeToken = getDesignToken()

    await render(
      <Segmented defaultValue="one" selectedTextColor="#1677ff" options={['one', 'two']} />,
    )

    expect(StyleSheet.flatten(screen.getByText('one').props.style).color).toBe('#1677ff')
    expect(StyleSheet.flatten(screen.getByText('two').props.style).color).toBe(themeToken.colorText)
  })

  it('follows selectedTextColor when the active item changes', async () => {
    const themeToken = getDesignToken()

    await render(
      <Segmented defaultValue="one" selectedTextColor="#1677ff" options={['one', 'two']} />,
    )

    await press(screen.getAllByRole('radio')[1])

    expect(StyleSheet.flatten(screen.getByText('one').props.style).color).toBe(themeToken.colorText)
    expect(StyleSheet.flatten(screen.getByText('two').props.style).color).toBe('#1677ff')
  })

  it('keeps disabled color ahead of selectedTextColor', async () => {
    const segmentedToken = getSegmentedToken(getDesignToken())

    await render(
      <Segmented
        defaultValue="one"
        selectedTextColor="#1677ff"
        options={[
          { label: 'one', value: 'one', disabled: true },
          { label: 'two', value: 'two' },
        ]}
      />,
    )

    expect(StyleSheet.flatten(screen.getByText('one').props.style).color).toBe(
      segmentedToken.disabledColor,
    )
  })

  it('uses the token selected text color when selectedTextColor is omitted', async () => {
    const segmentedToken = getSegmentedToken(getDesignToken())

    await render(<Segmented defaultValue="one" options={['one', 'two']} />)

    expect(StyleSheet.flatten(screen.getByText('one').props.style).color).toBe(
      segmentedToken.selectedTextColor,
    )
  })

  it('applies default, round, and custom radius to the container and thumb', async () => {
    const token = getDesignToken()
    const buttonToken = getButtonToken(token)

    await render(
      <>
        <Segmented testID="default" shape="default" options={['first', 'middle', 'last']} />
        <Segmented testID="round" shape="round" options={['first', 'middle', 'last']} />
        <Segmented testID="custom" borderRadius={12} options={['first', 'middle', 'last']} />
        <Segmented
          testID="custom-round"
          shape="round"
          borderRadius={12}
          options={['first', 'middle', 'last']}
        />
      </>,
    )

    const defaultRoot = StyleSheet.flatten(screen.getByTestId('default').props.style)
    const roundRoot = StyleSheet.flatten(screen.getByTestId('round').props.style)
    const customRoot = StyleSheet.flatten(screen.getByTestId('custom').props.style)
    const customRoundRoot = StyleSheet.flatten(screen.getByTestId('custom-round').props.style)
    expect(defaultRoot).toMatchObject({
      backgroundColor: getDesignToken().colorFillTertiary,
      borderColor: getDesignToken().colorBorder,
      borderWidth: token.lineWidth,
      borderRadius: buttonToken.borderRadius,
    })
    expect(roundRoot.borderRadius).toBe(buttonToken.borderRadiusRound)
    expect(customRoot.borderRadius).toBe(12)
    expect(customRoundRoot.borderRadius).toBe(12)

    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      const itemStyle = StyleSheet.flatten(radio.props.style)
      expect(itemStyle.borderRadius).toBeUndefined()
      expect(itemStyle.borderTopLeftRadius).toBeUndefined()
      expect(itemStyle.borderTopRightRadius).toBeUndefined()
      expect(itemStyle.borderBottomLeftRadius).toBeUndefined()
      expect(itemStyle.borderBottomRightRadius).toBeUndefined()
    }

    await measure(0, 0, 80)
    await measure(3, 0, 80)
    await measure(6, 0, 80)
    await measure(9, 0, 80)

    const thumbs = screen.getAllByTestId('segmented-thumb')
    expect(thumbs).toHaveLength(4)
    expect(StyleSheet.flatten(thumbs[0].props.style)).toMatchObject({
      backgroundColor: token.colorBgContainer,
      borderRadius: buttonToken.borderRadius,
    })
    expect(StyleSheet.flatten(thumbs[1].props.style).borderRadius).toBe(
      buttonToken.borderRadiusRound,
    )
    expect(StyleSheet.flatten(thumbs[2].props.style).borderRadius).toBe(12)
    expect(StyleSheet.flatten(thumbs[3].props.style).borderRadius).toBe(12)
    expect(thumbs[3].props.pointerEvents).toBe('none')
  })

  it('uses one radius for the root, selected background, and pressed option', () => {
    const token = getDesignToken()
    const buttonToken = getButtonToken(token)
    const segmentedToken = getSegmentedToken(token)

    for (const borderRadius of [buttonToken.borderRadius, buttonToken.borderRadiusRound, 12]) {
      const styles = getSegmentedStyles(token, segmentedToken, borderRadius, false, false)

      expect(styles.root.borderRadius).toBe(borderRadius)
      expect(styles.selectedBackground.borderRadius).toBe(borderRadius)
      expect(styles.optionPressed.borderRadius).toBe(borderRadius)
    }
  })

  it('uses Pressable background feedback only for enabled inactive options', async () => {
    const token = getDesignToken()
    const buttonToken = getButtonToken(token)
    const segmentedToken = getSegmentedToken(token)

    await render(
      <Segmented
        defaultValue="active"
        options={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Disabled', value: 'disabled', disabled: true },
        ]}
      />,
    )

    const [active, inactive, disabled] = screen.getAllByRole('radio')
    expect(StyleSheet.flatten(inactive.props.style).backgroundColor).toBeUndefined()

    fireEvent(inactive, 'pressIn')
    await waitFor(() => {
      expect(StyleSheet.flatten(screen.getAllByRole('radio')[1].props.style)).toMatchObject({
        backgroundColor: segmentedToken.pressedBackgroundColor,
        borderRadius: buttonToken.borderRadius,
      })
    })

    fireEvent(inactive, 'pressOut')
    await waitFor(() => {
      expect(StyleSheet.flatten(screen.getAllByRole('radio')[1].props.style).backgroundColor).toBe(
        undefined,
      )
    })

    fireEvent(active, 'pressIn')
    await waitFor(() => {
      expect(StyleSheet.flatten(screen.getAllByRole('radio')[0].props.style).backgroundColor).toBe(
        undefined,
      )
    })
    fireEvent(active, 'pressOut')
    fireEvent(disabled, 'pressIn')
    await waitFor(() => {
      const radios = screen.getAllByRole('radio')
      expect(StyleSheet.flatten(radios[1].props.style).backgroundColor).toBeUndefined()
      expect(StyleSheet.flatten(radios[0].props.style).backgroundColor).toBeUndefined()
      expect(StyleSheet.flatten(radios[2].props.style).backgroundColor).toBeUndefined()
    })
  })

  it('keeps the pressed radius aligned with default, round, and custom options', async () => {
    const token = getDesignToken()
    const buttonToken = getButtonToken(token)
    const segmentedToken = getSegmentedToken(token)

    await render(
      <>
        <Segmented defaultValue="active" options={['active', 'inactive']} />
        <Segmented defaultValue="active" shape="round" options={['active', 'inactive']} />
        <Segmented defaultValue="active" borderRadius={12} options={['active', 'inactive']} />
      </>,
    )

    for (const [index, radius] of [
      [1, buttonToken.borderRadius],
      [3, buttonToken.borderRadiusRound],
      [5, 12],
    ] as const) {
      fireEvent(screen.getAllByRole('radio')[index], 'pressIn')
      await waitFor(() => {
        expect(StyleSheet.flatten(screen.getAllByRole('radio')[index].props.style)).toMatchObject({
          backgroundColor: segmentedToken.pressedBackgroundColor,
          borderRadius: radius,
        })
      })

      fireEvent(screen.getAllByRole('radio')[index], 'pressOut')
      await waitFor(() => {
        const style = StyleSheet.flatten(screen.getAllByRole('radio')[index].props.style)
        expect(style.backgroundColor).toBeUndefined()
        expect(style.borderRadius).toBeUndefined()
      })
    }
  })

  it('animates both thumb position and width when the selected item changes', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)

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
      48,
      expect.objectContaining({
        duration: getDesignToken().motionDurationMid,
        easing: expect.any(Function),
      }),
      undefined,
    )
    expect(timing).toHaveBeenNthCalledWith(
      2,
      120,
      expect.objectContaining({
        duration: getDesignToken().motionDurationMid,
        easing: expect.any(Function),
      }),
      undefined,
    )

    timing.mockClear()
    await press(screen.getAllByRole('radio')[2])

    expect(timing).toHaveBeenNthCalledWith(
      1,
      168,
      expect.objectContaining({ duration: getDesignToken().motionDurationMid }),
      undefined,
    )
    expect(timing).toHaveBeenNthCalledWith(
      2,
      72,
      expect.objectContaining({ duration: getDesignToken().motionDurationMid }),
      undefined,
    )
  })

  it('does not animate a disabled control', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')

    await render(<Segmented disabled options={['one', 'two']} />)
    await measure(0, 0, 60)
    await measure(1, 60, 90)
    timing.mockClear()

    await press(screen.getAllByRole('radio')[1])

    expect(timing).not.toHaveBeenCalled()
  })
})
