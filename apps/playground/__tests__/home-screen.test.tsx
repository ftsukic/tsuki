/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import HomeScreen from '../components/home-screen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }), { virtual: true })
jest.mock('../components/demo-provider', () => ({
  useDemoTheme: () => ({ mode: 'system', dark: false, setMode: jest.fn() }),
}))
jest.mock('../fixtures/manifest.json', () => ({
  entries: [
    ...Array.from({ length: 55 }, () => ({ version: 'v1' })),
    ...Array.from({ length: 9 }, () => ({ version: 'v2' })),
  ],
}))
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native')
  return { SafeAreaView: View }
})

afterEach(async () => {
  await cleanup()
  mockPush.mockClear()
})

it('shows the catalog entry counts and four top-level destinations', async () => {
  await render(<HomeScreen />)

  expect(screen.getByTestId('home-components')).toBeTruthy()
  expect(screen.getByTestId('home-theme-playground')).toBeTruthy()
  expect(screen.getByTestId('home-design-tokens')).toBeTruthy()
  expect(screen.getByTestId('home-interaction-lab')).toBeTruthy()
  expect(screen.getByText(/Tsuki v2 · 9 examples\s+Legacy v1 · 55 examples/)).toBeTruthy()
})

it('navigates to Components, Theme Playground, Design Tokens, and Interaction Lab', async () => {
  await render(<HomeScreen />)

  await fireEvent.press(screen.getByTestId('home-components'))
  await fireEvent.press(screen.getByTestId('home-theme-playground'))
  await fireEvent.press(screen.getByTestId('home-design-tokens'))
  await fireEvent.press(screen.getByTestId('home-interaction-lab'))

  expect(mockPush.mock.calls).toEqual([
    ['/components'],
    ['/theme-playground'],
    ['/design-tokens'],
    ['/labs/interaction'],
  ])
})
