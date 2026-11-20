/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { TsukiProvider } from '@tsuki-v2/theme/tsuki-provider'
import GestureLab from '../app/labs/interaction/gesture'
import { NestedScrollLab } from '../components/interaction-lab/gesture/nested-scroll-lab'
import { PanLab } from '../components/interaction-lab/gesture/pan-lab'
import { ResistanceLab } from '../components/interaction-lab/gesture/resistance-lab'
import { SnapLab } from '../components/interaction-lab/gesture/snap-lab'
import { SwipeLab } from '../components/interaction-lab/gesture/swipe-lab'

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }), { virtual: true })

afterEach(async () => {
  await cleanup()
})

it('composes the full gesture page inside the coordinated Lab scroll container', async () => {
  await render(
    <TsukiProvider scheme="light">
      <GestureLab />
    </TsukiProvider>,
  )

  expect(screen.getByText('Gesture Runtime')).toBeTruthy()
  expect(screen.getByTestId('pan-lab-tile')).toBeTruthy()
  expect(screen.getByTestId('swipe-lab-target')).toBeTruthy()
  expect(screen.getByTestId('resistance-adjustable-tile')).toBeTruthy()
  expect(screen.getByTestId('snap-lab-tile')).toBeTruthy()
  expect(screen.getByTestId('nested-scroll-view')).toBeTruthy()
})

it('renders Pan against the v2 runtime and applies changed gesture parameters', async () => {
  await render(
    <TsukiProvider scheme="light">
      <PanLab />
    </TsukiProvider>,
  )

  expect(screen.getByTestId('pan-lab-tile')).toBeTruthy()
  expect(screen.getByTestId('pan-axis-auto').props.accessibilityState.selected).toBe(true)
  await fireEvent.press(screen.getByLabelText('Increase Min distance'))
  expect(screen.getByText('6 px')).toBeTruthy()
  await fireEvent.press(screen.getByTestId('pan-axis-vertical'))
  expect(screen.getByTestId('pan-axis-vertical').props.accessibilityState.selected).toBe(true)
})

it('renders Swipe controls for threshold, snap points, and release motion', async () => {
  await render(
    <TsukiProvider scheme="light">
      <SwipeLab />
    </TsukiProvider>,
  )

  expect(screen.getByTestId('swipe-lab-target')).toBeTruthy()
  expect(screen.getByTestId('swipe-snap-profile-three').props.accessibilityState.selected).toBe(
    true,
  )
  await fireEvent.press(screen.getByLabelText('Increase Threshold'))
  expect(screen.getByText('0.6')).toBeTruthy()
  await fireEvent.press(screen.getByTestId('swipe-settle-mode-decay'))
  expect(screen.getByTestId('swipe-settle-mode-decay').props.accessibilityState.selected).toBe(true)
})

it('compares fixed and adjustable resistance using draggable runtime targets', async () => {
  await render(
    <TsukiProvider scheme="light">
      <ResistanceLab />
    </TsukiProvider>,
  )

  expect(screen.getByTestId('resistance-fixed-tile')).toBeTruthy()
  expect(screen.getByTestId('resistance-adjustable-tile')).toBeTruthy()
  await fireEvent.press(screen.getByLabelText('Increase Adjustable resistance'))
  expect(screen.getByText('0.5')).toBeTruthy()
})

it('switches between a single snap point and multiple velocity-aware targets', async () => {
  await render(
    <TsukiProvider scheme="light">
      <SnapLab />
    </TsukiProvider>,
  )

  expect(screen.getByTestId('snap-lab-tile')).toBeTruthy()
  expect(screen.getByTestId('snap-profile-multiple').props.accessibilityState.selected).toBe(true)
  await fireEvent.press(screen.getByTestId('snap-profile-single'))
  expect(screen.getByTestId('snap-profile-single').props.accessibilityState.selected).toBe(true)
})

it('uses an explicit native scroll relationship and keeps taps observable', async () => {
  await render(
    <TsukiProvider scheme="light">
      <NestedScrollLab />
    </TsukiProvider>,
  )

  expect(screen.getByTestId('nested-scroll-view')).toBeTruthy()
  expect(screen.getByTestId('nested-pan-target')).toBeTruthy()
  expect(
    screen.getByTestId('nested-coordination-requireToFail').props.accessibilityState.selected,
  ).toBe(true)
  await fireEvent.press(screen.getByTestId('nested-coordination-simultaneous'))
  expect(
    screen.getByTestId('nested-coordination-simultaneous').props.accessibilityState.selected,
  ).toBe(true)
  await fireEvent.press(screen.getByTestId('nested-coordination-requireToFail'))
  expect(
    screen.getByTestId('nested-coordination-requireToFail').props.accessibilityState.selected,
  ).toBe(true)
  expect(screen.getByText('Tap count')).toBeTruthy()
  expect(screen.getByText('Tap or drag horizontally')).toBeTruthy()
})
