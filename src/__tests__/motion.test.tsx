import { cleanup, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import {
  Animated,
  getTransitionStyle,
  useAnimatedTransition,
  useTransitionProgress,
} from '../motion'
import type { MotionTransitionType } from '../motion'

function TransitionHarness({
  enteringDuration,
  type,
  visible,
}: {
  enteringDuration?: number
  type: MotionTransitionType
  visible: boolean
}) {
  const style = useAnimatedTransition({
    entering: enteringDuration === undefined ? undefined : { duration: enteringDuration },
    visible,
    type,
  })
  return (
    <Animated.View testID="transition" style={style}>
      <Text>content</Text>
    </Animated.View>
  )
}

function ProgressHarness({
  onTransitionEnd,
  visible,
}: {
  onTransitionEnd?: (visible: boolean) => void
  visible: boolean
}) {
  const { progress, animatedStyle } = useTransitionProgress({
    entering: { duration: 0 },
    onTransitionEnd,
    type: 'fade',
    visible,
  })

  return (
    <Animated.View testID="progress-transition" style={animatedStyle}>
      <Text testID="progress-value">{progress.value}</Text>
    </Animated.View>
  )
}

describe('useAnimatedTransition', () => {
  afterEach(cleanup)

  it('mounts in the visible endpoint for an entering transition', async () => {
    await render(<TransitionHarness enteringDuration={0} type="fade" visible />)

    expect(screen.getByText('content')).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByTestId('transition').props.style)).toMatchObject({
      opacity: 1,
    })
  })

  it('keeps the content mounted while transitioning to the hidden endpoint', async () => {
    const view = await render(<TransitionHarness type="slide-up" visible />)

    await view.rerender(<TransitionHarness type="slide-up" visible={false} />)

    expect(screen.getByText('content')).toBeTruthy()
    expect(
      getTransitionStyle({ type: 'slide-up', progress: 0, distance: 32, scale: 0.92 }),
    ).toEqual({
      transform: [{ translateY: 32 }],
    })
  })

  it('fades scale transitions when an opacity endpoint is provided', () => {
    expect(
      getTransitionStyle({ type: 'scale', progress: 0, distance: 32, scale: 0.8, opacity: 1 }),
    ).toEqual({
      opacity: 0,
      transform: [{ scale: 0.8 }],
    })
  })

  it('exposes the shared progress without changing the legacy style return value', async () => {
    const onTransitionEnd = jest.fn()
    await render(<ProgressHarness visible onTransitionEnd={onTransitionEnd} />)

    expect(screen.getByTestId('progress-value').props.children).toBe(1)
    expect(StyleSheet.flatten(screen.getByTestId('progress-transition').props.style)).toMatchObject(
      {
        opacity: 1,
      },
    )
    expect(onTransitionEnd).toHaveBeenCalledWith(true)
  })
})
