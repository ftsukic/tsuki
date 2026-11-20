/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { TsukiProvider } from '@tsuki-v2/theme/tsuki-provider'
import { FeedbackLab } from '../components/interaction-lab/pressable/feedback-lab'
import { StyleConflictLab } from '../components/interaction-lab/pressable/style-conflict-lab'

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }), { virtual: true })

afterEach(async () => {
  await cleanup()
})

it('uses the v2 runtime for all five feedback modes and records native event order', async () => {
  await render(
    <TsukiProvider scheme="light">
      <FeedbackLab />
    </TsukiProvider>,
  )

  const target = screen.getByTestId('pressable-lab-target')
  for (const mode of ['opacity', 'scale', 'background', 'overlay', 'none']) {
    const modeButton = screen.getByTestId('press-feedback-' + mode)
    await fireEvent.press(modeButton)
    expect(modeButton.props.accessibilityState.selected).toBe(true)
    expect(screen.getByTestId('pressable-lab-target')).toBeTruthy()
  }

  await fireEvent.press(screen.getByText('Clear events'))
  await fireEvent(target, 'pressIn')
  await fireEvent(target, 'pressOut')
  await fireEvent(target, 'press')
  expect(screen.getByText('press in → press out → press')).toBeTruthy()
})

it('shows explicit style precedence over feedback', async () => {
  await render(
    <TsukiProvider scheme="light">
      <StyleConflictLab />
    </TsukiProvider>,
  )

  expect(screen.getByText('feedback is visible')).toBeTruthy()
  await fireEvent.press(screen.getByText('Set styles.root conflict'))
  expect(screen.getByText('styles.root overrides feedback')).toBeTruthy()
  await fireEvent.press(screen.getByText('Set style conflict'))
  expect(screen.getByText('style overrides styles.root and feedback')).toBeTruthy()
})
