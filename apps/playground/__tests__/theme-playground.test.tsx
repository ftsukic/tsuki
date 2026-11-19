/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import ThemePlayground from '../components/theme-playground'

const mockSetMode = jest.fn()

jest.mock('../components/demo-provider', () => ({
  useDemoTheme: () => ({ mode: 'system', dark: false, setMode: mockSetMode }),
}))

jest.mock('../components/v2-preview', () => {
  const React = jest.requireActual('react')
  const { View } = jest.requireActual('react-native')
  const { TsukiProvider } = jest.requireActual('../../../packages/tsuki/src')

  return {
    V2Preview: ({ children }: { children: ReactNode }) =>
      React.createElement(TsukiProvider, { scheme: 'light' }, children),
    V2ThemeVariables: ({ children }: { children: ReactNode }) =>
      React.createElement(View, null, children),
  }
})

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native')
  return { SafeAreaView: View }
})

afterEach(async () => {
  await cleanup()
  mockSetMode.mockClear()
})

it('shows resolved semantic colors alongside exact light and dark defaults', async () => {
  await render(<ThemePlayground />)

  expect(await screen.findByText('Current #055FFD')).toBeTruthy()
  expect(screen.getByText('Light #055FFD')).toBeTruthy()
  expect(screen.getByText('Dark #4D8DFF')).toBeTruthy()
  expect(screen.getByTestId('semantic-token-colorPrimary')).toBeTruthy()
})

it('changes the Playground appearance and applies component token overrides live', async () => {
  await render(<ThemePlayground />)

  const appearance = screen.getByTestId('appearance-section')
  await fireEvent.press(within(appearance).getByText('Dark'))
  expect(mockSetMode).toHaveBeenCalledWith('dark')

  const buttonHeight = screen.getByTestId('token-input-Button-height')
  await fireEvent.changeText(buttonHeight, '64')
  expect(screen.getByTestId('token-input-Button-height').props.value).toBe('64')
  await fireEvent.press(screen.getByTestId('reset-component-overrides'))
  expect(screen.getByTestId('token-input-Button-height').props.value).toBe('44')
})

it('demonstrates inherited, non-inherited, dynamic, and reset nested themes', async () => {
  await render(<ThemePlayground />)

  expect(screen.getByTestId('nested-parent-surface').props.children).toContain('#f9fafb')
  expect(screen.getByTestId('nested-child-surface').props.children).toContain('#f9fafb')
  expect(screen.getByTestId('nested-inherit-false-surface').props.children).toContain('#f9fafb')

  await fireEvent.press(screen.getByTestId('nested-dynamic-update'))
  expect(screen.getByTestId('nested-parent-primary').props.children).toContain('#7c3aed')
  expect(screen.getByTestId('nested-parent-surface').props.children).toContain('#fffbeb')
  expect(screen.getByTestId('nested-child-primary').props.children).toContain('#e11d48')
  expect(screen.getByTestId('nested-child-surface').props.children).toContain('#fffbeb')
  expect(screen.getByTestId('nested-inherit-false-surface').props.children).toContain('#f9fafb')
  expect(screen.getByTestId('nested-inherit-false-card-radius').props.children).toEqual(
    expect.arrayContaining([12]),
  )

  await fireEvent.press(screen.getByTestId('nested-reset-theme'))
  expect(screen.getByTestId('nested-parent-primary').props.children).toContain('#055FFD')
  expect(screen.getByTestId('nested-parent-surface').props.children).toContain('#f9fafb')
})
