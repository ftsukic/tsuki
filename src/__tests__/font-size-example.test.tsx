import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import FontSizePage from '@/pages/font-size'
import { useAppTheme, useAppThemeSettings } from '@/theme'
import { useAppThemeDefinition } from '@/theme/use-app-theme'
import { defaultAppTheme } from '../../example/theme/tokens'
import { resolveAppTheme } from '../../example/theme/resolve-app-theme'

jest.mock('@/theme', () => {
  const actual = jest.requireActual('@/theme')
  return { ...actual, useAppTheme: jest.fn(), useAppThemeSettings: jest.fn() }
})
jest.mock('@/theme/use-app-theme', () => ({ useAppThemeDefinition: jest.fn() }))

it('previews the font-size mapping locally, cancels without saving and applies on completion', async () => {
  const save = jest.fn(),
    back = jest.fn()
  jest.mocked(useAppTheme).mockReturnValue(resolveAppTheme(defaultAppTheme, { mode: 'light' }))
  jest.mocked(useAppThemeDefinition).mockReturnValue(defaultAppTheme)
  jest.mocked(useAppThemeSettings).mockReturnValue({
    mode: 'light',
    setMode: jest.fn(),
    baseFontSize: 18,
    setBaseFontSize: save,
  })
  await render(<FontSizePage onBack={back} />)
  await waitFor(() =>
    expect(StyleSheet.flatten(screen.getByText('预览字体大小').props.style)).toMatchObject({
      fontSize: 18,
      lineHeight: 27,
    }),
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
    expect(StyleSheet.flatten(screen.getByText('预览字体大小').props.style)).toMatchObject({
      fontSize: 30,
      lineHeight: 45,
    }),
  )
  expect(save).not.toHaveBeenCalled()
  fireEvent.press(screen.getByRole('button', { name: '取消' }))
  expect(save).not.toHaveBeenCalled()
  await waitFor(() => expect(back).toHaveBeenCalledTimes(1))
  fireEvent.press(screen.getByRole('button', { name: '完成' }))
  await waitFor(() => expect(save).toHaveBeenCalledWith(30))
})
