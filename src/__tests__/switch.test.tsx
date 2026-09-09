import { fireEvent, render, screen } from '@testing-library/react-native'
import { act } from '@testing-library/react-native'
import { Animated, StyleSheet } from 'react-native'
import {
  ConfigProvider,
  Switch,
  getDesignToken,
  getSwitchDimensions,
  getSwitchToken,
  getSwitchTranslateX,
} from '..'

async function press(testID: string) {
  fireEvent.press(screen.getByTestId(testID))
  await Promise.resolve()
}

describe('Switch', () => {
  beforeEach(() => {
    jest.spyOn(Animated, 'timing').mockImplementation(
      () =>
        ({
          _isUsingNativeDriver: jest.fn(() => false),
          reset: jest.fn(),
          start: jest.fn(),
          stop: jest.fn(),
        }) as unknown as Animated.CompositeAnimation,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('supports uncontrolled defaultValue and emits the next value', async () => {
    const onChange = jest.fn()

    await render(<Switch defaultValue onChange={onChange} testID="switch" />)

    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch')
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(true)

    await press('switch')

    expect(onChange).toHaveBeenCalledWith(false)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)
  })

  it('keeps controlled value until the parent updates it', async () => {
    const onChange = jest.fn()
    const view = await render(<Switch onChange={onChange} testID="switch" value={false} />)

    await press('switch')

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)

    await view.rerender(<Switch onChange={onChange} testID="switch" value />)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(true)
  })

  it('blocks disabled and loading switches', async () => {
    const onPress = jest.fn()
    const onChange = jest.fn()

    await render(
      <>
        <Switch disabled onChange={onChange} onPress={onPress} testID="disabled" />
        <Switch loading onChange={onChange} onPress={onPress} testID="loading" />
      </>,
    )

    await press('disabled')
    await press('loading')

    expect(onPress).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('disabled').props.accessibilityState).toMatchObject({
      checked: false,
      disabled: true,
    })
    expect(screen.getByTestId('loading').props.accessibilityState).toMatchObject({
      busy: true,
      checked: false,
      disabled: true,
    })
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  it('cancels a transition when beforeChange returns false', async () => {
    const beforeChange = jest.fn(() => false)
    const onChange = jest.fn()

    await render(<Switch beforeChange={beforeChange} onChange={onChange} testID="switch" />)

    await press('switch')

    expect(beforeChange).toHaveBeenCalledWith(true)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)
  })

  it('waits for an async beforeChange result before updating', async () => {
    let resolve: ((allowed: boolean) => void) | undefined
    const beforeChange = jest.fn(
      () =>
        new Promise<boolean>((nextResolve) => {
          resolve = nextResolve
        }),
    )
    const onChange = jest.fn()

    await render(<Switch beforeChange={beforeChange} onChange={onChange} testID="switch" />)

    await press('switch')
    expect(onChange).not.toHaveBeenCalled()

    await act(async () => {
      resolve?.(true)
      await Promise.resolve()
    })

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(true)
  })

  it('maps custom active and inactive values', async () => {
    const onChange = jest.fn()

    await render(
      <Switch
        activeValue="on"
        defaultValue="off"
        inactiveValue="off"
        onChange={onChange}
        testID="switch"
      />,
    )

    await press('switch')
    await press('switch')

    expect(onChange).toHaveBeenNthCalledWith(1, 'on')
    expect(onChange).toHaveBeenNthCalledWith(2, 'off')
  })

  it('uses tokenized named sizes and numeric switch geometry', () => {
    const themeToken = getDesignToken()
    const token = getSwitchToken(themeToken)

    expect(getSwitchDimensions(token, 'small')).toEqual({ height: 20, width: 32 })
    expect(getSwitchDimensions(token, 'medium')).toEqual({ height: 24, width: 44 })
    expect(getSwitchDimensions(token, 'large')).toEqual({ height: 32, width: 52 })
    expect(getSwitchDimensions(token, 24)).toEqual({ height: 24, width: 48 })
    expect(getSwitchTranslateX(token, { height: 24, width: 48 })).toBe(24)
  })

  it('applies themed colors and pressed interaction styles', async () => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Switch: { activeColor: '#123456', inactiveColor: '#654321' },
          },
        }}
      >
        <Switch testID="switch" />
      </ConfigProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('switch-track').props.style)).toMatchObject({
      backgroundColor: 'rgba(101, 67, 33, 1)',
      height: 24,
      width: 44,
    })

    await act(async () => {
      screen.getByTestId('switch').props.onResponderGrant({
        nativeEvent: {},
        persist: () => undefined,
      })
    })

    expect(StyleSheet.flatten(screen.getByTestId('switch').props.style).opacity).toBe(
      getSwitchToken(getDesignToken()).activeOpacity,
    )
  })

  it('animates state changes with the component motion token', async () => {
    await render(<Switch testID="switch" />)
    await press('switch')

    expect(Animated.timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: getSwitchToken(getDesignToken()).animationDuration,
        easing: expect.any(Function),
        toValue: 1,
        useNativeDriver: false,
      }),
    )
  })
})
