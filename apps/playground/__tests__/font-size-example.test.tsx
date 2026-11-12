import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import FontSizePage from '@/pages/font-size'
import { useDemoTheme } from '@/components/demo-provider'

jest.mock('@/components/demo-provider', () => ({ useDemoTheme: jest.fn() }))

it('previews the font-size mapping locally, cancels without saving and applies on completion', async () => {
  const save = jest.fn(),
    back = jest.fn()
  jest.mocked(useDemoTheme).mockReturnValue({
    mode: 'light',
    dark: false,
    setMode: jest.fn(),
    fontSize: 18,
    setFontSize: save,
  })
  await render(<FontSizePage onBack={back} />)
  await waitFor(() =>
    expect(StyleSheet.flatten(screen.getByText('预览字体大小').props.style).fontSize).toBe(18),
  )
  await act(async () => {
    screen
      .getByTestId('font-size-slider-body')
      .props.onLayout({ nativeEvent: { layout: { x: 0, width: 300, height: 44 } } })
  })
  await act(async () => {
    fireGestureHandler(getByGestureTestId('font-size-slider-tap'), [
      { state: State.BEGAN, x: 300 },
      { state: State.ACTIVE, x: 300 },
      { state: State.END, x: 300 },
    ])
  })
  await waitFor(() =>
    expect(StyleSheet.flatten(screen.getByText('预览字体大小').props.style).fontSize).toBe(30),
  )
  expect(save).not.toHaveBeenCalled()
  fireEvent.press(screen.getByRole('button', { name: '取消' }))
  expect(save).not.toHaveBeenCalled()
  await waitFor(() => expect(back).toHaveBeenCalledTimes(1))
  fireEvent.press(screen.getByRole('button', { name: '完成' }))
  await waitFor(() => expect(save).toHaveBeenCalledWith(30))
})
