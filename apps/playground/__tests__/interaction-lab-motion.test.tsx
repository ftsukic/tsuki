/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { TsukiProvider } from '@tsuki-v2/theme/tsuki-provider'
import { withTiming } from 'react-native-reanimated'
import { PresetLab } from '../components/interaction-lab/motion/preset-lab'
import { TimingLab } from '../components/interaction-lab/motion/timing-lab'

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }), { virtual: true })

const timing = withTiming as jest.Mock

afterEach(async () => {
  await cleanup()
  timing.mockClear()
})

it('shows all ten runtime presets and starts the selected preset through MotionValue', async () => {
  await render(
    <TsukiProvider scheme="light">
      <PresetLab />
    </TsukiProvider>,
  )

  for (const preset of [
    'fade',
    'scale',
    'scale-fade',
    'slide-up',
    'slide-down',
    'slide-left',
    'slide-right',
    'fade-up',
    'fade-down',
    'spring-scale',
  ]) {
    expect(screen.getByTestId('motion-preset-' + preset)).toBeTruthy()
  }

  await fireEvent.press(screen.getByTestId('motion-preset-fade'))
  await fireEvent.press(screen.getByText('Play preset'))

  expect(timing).toHaveBeenCalledWith(
    1,
    expect.objectContaining({ duration: 420 }),
    expect.any(Function),
  )
})

it('applies changed timing parameters to the v2 animation primitive', async () => {
  await render(
    <TsukiProvider scheme="light">
      <TimingLab />
    </TsukiProvider>,
  )

  await fireEvent.press(screen.getByLabelText('Increase Duration'))
  expect(screen.getByText('600 ms')).toBeTruthy()

  await fireEvent.press(screen.getByText('Play'))
  expect(timing).toHaveBeenCalledWith(
    1,
    expect.objectContaining({ duration: 600 }),
    expect.any(Function),
  )
})
