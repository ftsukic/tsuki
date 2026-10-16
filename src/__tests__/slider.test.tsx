import { useState } from 'react'
import * as Reanimated from 'react-native-reanimated'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { StyleSheet, Text } from 'react-native'
import { ConfigProvider, Slider } from '..'
import { normalizeSliderBounds, normalizeSliderValue } from '../slider/value'

async function measure() {
  await act(async () => {
    screen
      .getByTestId('slider-body')
      .props.onLayout({ nativeEvent: { layout: { width: 300, height: 44, x: 0 } } })
  })
}
async function tap(x: number) {
  await act(async () => {
    fireGestureHandler(getByGestureTestId('slider-tap'), [
      { state: State.BEGAN, x },
      { state: State.ACTIVE, x },
      { state: State.END, x },
    ])
  })
}
async function drag(x: number, canceled = false) {
  await act(async () => {
    fireGestureHandler(getByGestureTestId('slider-pan'), [
      { state: State.BEGAN, x: 0 },
      { state: State.ACTIVE, x: 0 },
      { x },
      { state: canceled ? State.CANCELLED : State.END, x },
    ])
  })
}

it('normalizes bounds, decimal steps, invalid values and endpoints', () => {
  expect(normalizeSliderBounds(NaN, -10, 0)).toEqual({ min: 0, max: 0, step: 1 })
  expect(normalizeSliderValue(0.31, 0.1, 1, 0.1)).toBe(0.3)
  expect(normalizeSliderValue(100, 0, 1, 0.3)).toBe(1)
  expect(normalizeSliderValue(NaN, 12, 24, 2)).toBe(12)
})

it('updates uncontrolled values on tap, snaps and completes once', async () => {
  const change = jest.fn(),
    complete = jest.fn()
  await render(
    <Slider
      testID="slider"
      min={0}
      max={6}
      defaultValue={1}
      onChange={change}
      onChangeComplete={complete}
    />,
  )
  await measure()
  await tap(150)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(3))
  expect(screen.getByRole('adjustable').props['aria-valuenow']).toBe(3)
  expect(change).toHaveBeenCalledWith(3)
  expect(complete).toHaveBeenCalledTimes(1)
  await tap(150)
  expect(complete).toHaveBeenCalledTimes(1)
})

it('keeps controlled ownership and supports parent writeback', async () => {
  const change = jest.fn()
  const view = await render(<Slider testID="slider" value={20} onChange={change} />)
  await measure()
  await tap(240)
  expect(change).toHaveBeenCalledWith(80)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(20))
  await view.rerender(<Slider testID="slider" value={80} onChange={change} />)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(80))
})

it('supports controlled parent updates throughout a drag', async () => {
  const complete = jest.fn()
  function Controlled() {
    const [value, setValue] = useState(0)
    return <Slider testID="slider" value={value} onChange={setValue} onChangeComplete={complete} />
  }
  await render(<Controlled />)
  await measure()
  await drag(225)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(75))
  await waitFor(() => expect(complete).toHaveBeenCalledWith(75))
})

it('clamps drags and does not complete canceled gestures', async () => {
  const complete = jest.fn()
  await render(<Slider testID="slider" defaultValue={0} onChangeComplete={complete} />)
  await measure()
  await drag(900)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(100))
  complete.mockClear()
  await drag(-100, true)
  expect(complete).not.toHaveBeenCalled()
})

it('reverses coordinate mapping and applies the configured step', async () => {
  await render(<Slider testID="slider" reverse min={12} max={24} step={2} />)
  await measure()
  await tap(50)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(22))
})

it('supports accessibility adjustments and forwards custom actions', async () => {
  const complete = jest.fn(),
    custom = jest.fn()
  await render(
    <Slider
      min={12}
      max={24}
      step={2}
      defaultValue={14}
      onChangeComplete={complete}
      onAccessibilityAction={custom}
    />,
  )
  fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', {
    nativeEvent: { actionName: 'increment' },
  })
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(16))
  await waitFor(() => expect(complete).toHaveBeenCalledWith(16))
  fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', {
    nativeEvent: { actionName: 'custom' },
  })
  await waitFor(() => expect(custom).toHaveBeenCalledTimes(1))
})

it.each([{ disabled: true }, { readonly: true }, { min: 10, max: 10 }])(
  'blocks adjustments for %p',
  async (props) => {
    const change = jest.fn()
    await render(<Slider {...props} onChange={change} />)
    fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    })
    expect(change).not.toHaveBeenCalled()
  },
)

it('resolves token overrides, semantic styles, marks and thumb content', async () => {
  await render(
    <ConfigProvider theme={{ components: { Slider: { thumbSize: 32, trackColor: 'red' } } }}>
      <Slider
        testID="slider"
        defaultValue={50}
        marks={{ 0: '小', 50: '标准', 100: '大' }}
        styles={({ state }) => ({ root: { margin: state.value } })}
        renderThumb={({ value }) => <Text>{value}</Text>}
      />
    </ConfigProvider>,
  )
  expect(StyleSheet.flatten(screen.getByTestId('slider').props.style)).toMatchObject({
    margin: 50,
    paddingHorizontal: 16,
  })
  expect(screen.getByText('标准')).toBeTruthy()
  expect(screen.getByText('50')).toBeTruthy()
})

it('selects the preceding step when decrementing an off-grid maximum', async () => {
  await render(<Slider min={0} max={1} step={0.3} defaultValue={1} />)
  fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', {
    nativeEvent: { actionName: 'decrement' },
  })
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(0.9))
})

it('includes the thumb edge in the touch target and subtracts the track inset', async () => {
  await render(<Slider testID="slider" defaultValue={50} />)
  await act(async () => {
    screen
      .getByTestId('slider-body')
      .props.onLayout({ nativeEvent: { layout: { x: 12, width: 300, height: 44 } } })
  })
  await tap(0)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(0))
  await tap(162)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(50))
  await tap(324)
  await waitFor(() => expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(100))
})

it('keeps the Dumi static adapter interactive through responder events', async () => {
  const original = Reanimated.useSharedValue
  const spy = jest
    .spyOn(Reanimated, 'useSharedValue')
    .mockImplementation((value) => Object.assign(original(value), { __tsukiStaticAdapter: true }))
  try {
    const complete = jest.fn()
    await render(<Slider testID="slider" defaultValue={0} onChangeComplete={complete} />)
    await measure()
    fireEvent(screen.getByTestId('slider'), 'responderGrant', {
      nativeEvent: { locationX: 150 },
    })
    await waitFor(() =>
      expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(50),
    )
    fireEvent(screen.getByTestId('slider'), 'responderRelease', {
      nativeEvent: { locationX: 240 },
    })
    await waitFor(() => expect(complete).toHaveBeenCalledWith(80))
  } finally {
    spy.mockRestore()
  }
})
