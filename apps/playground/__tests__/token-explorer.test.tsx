/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import * as Clipboard from 'expo-clipboard'
import TokenExplorer from '../components/token-explorer'

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }))
jest.mock('../components/v2-preview', () => {
  const React = jest.requireActual('react')
  const { TsukiProvider } = jest.requireActual('../../../packages/tsuki/src')

  return {
    V2Preview: ({ children }: { children: ReactNode }) =>
      React.createElement(TsukiProvider, { scheme: 'light' }, children),
  }
})
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native')
  return { SafeAreaView: View }
})

afterEach(async () => {
  await cleanup()
  jest.clearAllMocks()
})

it('lists the existing semantic and component tokens with Light and Dark values', async () => {
  await render(<TokenExplorer />)

  expect(await screen.findByText('61 available tokens')).toBeTruthy()
  expect(screen.getByTestId('color-tokens')).toBeTruthy()
  expect(screen.getByTestId('token-row-color-tokens-semantic.colorPrimary')).toBeTruthy()
  expect(
    screen.getByTestId('token-row-component-tokens-components.Button.borderRadius'),
  ).toBeTruthy()
  expect(screen.getByTestId('token-row-component-tokens-components.Cell.fontSize')).toBeTruthy()
  expect(
    screen.getByTestId('token-row-component-tokens-components.Dialog.backgroundColor'),
  ).toBeTruthy()
  expect(
    screen.getByTestId('token-row-component-tokens-components.Popup.backgroundColor'),
  ).toBeTruthy()
  expect(
    within(
      screen.getByTestId('token-row-component-tokens-components.Dialog.backgroundColor'),
    ).getByText('Dark: #1f2937'),
  ).toBeTruthy()
  expect(
    within(
      screen.getByTestId('token-row-component-tokens-components.Button.borderRadius'),
    ).getByText('Current: 8 dp'),
  ).toBeTruthy()
  expect(screen.getByText('Dark: #4D8DFF')).toBeTruthy()
  expect(
    screen.getByText(/Font family, font weight, and letter spacing are not global Theme tokens/),
  ).toBeTruthy()
})

it('copies the public token name and reports the result', async () => {
  await render(<TokenExplorer />)

  await fireEvent.press(screen.getByTestId('copy-token-color-tokens-semantic-colorPrimary'))

  await waitFor(() =>
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('semantic.colorPrimary'),
  )
  expect(screen.getByText('Copied')).toBeTruthy()
})
