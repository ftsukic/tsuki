/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import InteractionLabIndex from '../app/labs/interaction'

const mockPush = jest.fn()
const mockSetMotion = jest.fn()

jest.mock(
  'expo-router',
  () => ({
    useRouter: () => ({ push: mockPush, back: jest.fn() }),
  }),
  { virtual: true },
)
jest.mock('../components/interaction-lab/interaction-lab-provider', () => ({
  useInteractionLab: () => ({
    motion: { enabled: true, reducedMotion: 'system', durationScale: 1 },
    setMotion: mockSetMotion,
  }),
}))

afterEach(async () => {
  await cleanup()
  mockPush.mockClear()
  mockSetMotion.mockClear()
})

it('navigates to each independent interaction experiment', async () => {
  await render(<InteractionLabIndex />)

  await fireEvent.press(screen.getByTestId('interaction-lab-motion'))
  await fireEvent.press(screen.getByTestId('interaction-lab-pressable'))
  await fireEvent.press(screen.getByTestId('interaction-lab-gesture'))

  expect(mockPush.mock.calls).toEqual([
    ['/labs/interaction/motion'],
    ['/labs/interaction/pressable'],
    ['/labs/interaction/gesture'],
  ])
})

it('updates the global motion policy controls', async () => {
  await render(<InteractionLabIndex />)

  await fireEvent.press(screen.getByTestId('motion-policy-disabled'))
  expect(mockSetMotion).toHaveBeenCalledWith({
    enabled: false,
    reducedMotion: 'system',
    durationScale: 1,
  })

  await fireEvent.press(screen.getByTestId('reduced-motion-always'))
  expect(mockSetMotion).toHaveBeenLastCalledWith({
    enabled: true,
    reducedMotion: 'always',
    durationScale: 1,
  })

  await fireEvent.press(screen.getByTestId('duration-scale-0.5'))
  expect(mockSetMotion).toHaveBeenLastCalledWith({
    enabled: true,
    reducedMotion: 'system',
    durationScale: 0.5,
  })
})
