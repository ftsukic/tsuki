import { act, cleanup, render, screen } from '@testing-library/react-native'
import { AccessibilityInfo, StyleSheet, Text } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { Animated, motionPresets, useAnimatedTransition, useTransitionProgress } from '../motion'
import { getTransitionStyle } from '../motion/transition-style'
import { sampleSpring } from '../motion/animation'
import type { MotionTransitionType, UseAnimatedTransitionOptions } from '../motion'
import { ConfigProvider } from '../theme'

function MotionHarness(options: UseAnimatedTransitionOptions) {
  const { animatedStyle, progress } = useTransitionProgress(options)
  return (
    <Animated.View testID="motion" style={animatedStyle}>
      <Text testID="motion-progress">{progress.value}</Text>
    </Animated.View>
  )
}

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
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

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

  it('fades scale transitions when fade is enabled', () => {
    expect(
      getTransitionStyle({
        type: 'scale',
        progress: 0,
        distance: 32,
        scale: 0.8,
        opacity: 1,
        fade: true,
      }),
    ).toEqual({
      opacity: 0,
      transform: [{ scale: 0.8 }],
    })
  })

  it('exposes the shared progress alongside the animated style', async () => {
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

  it.each(['dialog', 'popover', 'toast'] as const)(
    'fully hides the %s semantic preset at its closed endpoint',
    async (name) => {
      await render(<MotionHarness visible={false} motion={false} preset={motionPresets[name]} />)
      expect(StyleSheet.flatten(screen.getByTestId('motion').props.style).opacity).toBe(0)
    },
  )

  it('uses the theme duration when no transition duration is specified', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)

    await render(
      <ConfigProvider theme={{ token: { motionDurationMid: 420 } }}>
        <MotionHarness visible />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 420 }),
      expect.any(Function),
    )
  })

  it('allows an explicit duration to override the theme duration', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)

    await render(
      <ConfigProvider theme={{ token: { motionDurationMid: 420 } }}>
        <MotionHarness visible entering={{ duration: 120 }} />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 120 }),
      expect.any(Function),
    )
  })

  it('merges an entering override with the preset spring configuration', async () => {
    const spring = jest.spyOn(Reanimated, 'withSpring').mockImplementation((value) => value)

    await render(
      <MotionHarness
        visible
        entering={{ damping: 24 }}
        preset={{
          type: 'scale',
          entering: { mode: 'spring', damping: 12, stiffness: 160, mass: 0.8 },
        }}
      />,
    )

    expect(spring).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ damping: 24, stiffness: 160, mass: 0.8 }),
      expect.any(Function),
    )
  })

  it('reaches the endpoint immediately when the theme disables a spring', async () => {
    const spring = jest.spyOn(Reanimated, 'withSpring')
    const onTransitionEnd = jest.fn()

    await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <MotionHarness
          visible
          motion
          entering={{ mode: 'spring' }}
          onTransitionEnd={onTransitionEnd}
        />
      </ConfigProvider>,
    )

    expect(spring).not.toHaveBeenCalled()
    expect(screen.getByTestId('motion-progress').props.children).toBe(1)
    expect(StyleSheet.flatten(screen.getByTestId('motion').props.style)).toMatchObject({
      opacity: 1,
    })
    expect(onTransitionEnd).toHaveBeenCalledTimes(1)
    expect(onTransitionEnd).toHaveBeenCalledWith(true)
  })

  it('allows an individual transition to disable motion', async () => {
    const spring = jest.spyOn(Reanimated, 'withSpring')
    const onTransitionEnd = jest.fn()
    const view = await render(
      <MotionHarness
        visible
        motion={false}
        entering={{ mode: 'spring' }}
        leaving={{ mode: 'spring' }}
        onTransitionEnd={onTransitionEnd}
      />,
    )

    await view.rerender(
      <MotionHarness
        visible={false}
        motion={false}
        entering={{ mode: 'spring' }}
        leaving={{ mode: 'spring' }}
        onTransitionEnd={onTransitionEnd}
      />,
    )

    expect(spring).not.toHaveBeenCalled()
    expect(screen.getByTestId('motion-progress').props.children).toBe(0)
    expect(onTransitionEnd.mock.calls).toEqual([[true], [false]])
  })

  it('reaches the endpoint when reduced motion is explicitly always enabled', async () => {
    const spring = jest.spyOn(Reanimated, 'withSpring')
    const onTransitionEnd = jest.fn()

    await render(
      <MotionHarness
        visible
        entering={{ mode: 'spring', reduceMotion: Reanimated.ReduceMotion.Always }}
        onTransitionEnd={onTransitionEnd}
      />,
    )

    expect(spring).not.toHaveBeenCalled()
    expect(screen.getByTestId('motion-progress').props.children).toBe(1)
    expect(onTransitionEnd.mock.calls).toEqual([[true]])
  })

  it('allows explicit never to keep animating when the system reduces motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
    const spring = jest.spyOn(Reanimated, 'withSpring').mockImplementation(() => 0.4)

    await render(
      <MotionHarness
        visible
        entering={{ mode: 'spring', reduceMotion: Reanimated.ReduceMotion.Never }}
      />,
    )

    expect(spring).toHaveBeenCalledTimes(1)
    expect(spring).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ reduceMotion: Reanimated.ReduceMotion.Never }),
      expect.any(Function),
    )
  })

  it.each(['timing', 'spring'] as const)(
    'uses the initial reduced-motion setting and resumes %s after the system enables animation',
    async (mode) => {
      jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true)
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
      let changeSystemSetting: ((value: boolean) => void) | undefined
      const addEventListener = ((event: string, listener: unknown) => {
        if (event === 'reduceMotionChanged') {
          changeSystemSetting = listener as (value: boolean) => void
        }
        return { remove: jest.fn() }
      }) as unknown as typeof AccessibilityInfo.addEventListener
      jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(addEventListener)
      const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation(() => 0.4)
      const spring = jest.spyOn(Reanimated, 'withSpring').mockImplementation(() => 0.4)
      const config = { mode, reduceMotion: Reanimated.ReduceMotion.System }
      const view = await render(<MotionHarness visible entering={config} leaving={config} />)

      expect(timing).not.toHaveBeenCalled()
      expect(spring).not.toHaveBeenCalled()
      expect(screen.getByTestId('motion-progress').props.children).toBe(1)

      await act(async () => {
        changeSystemSetting?.(false)
      })
      await view.rerender(<MotionHarness visible={false} entering={config} leaving={config} />)

      expect(mode === 'spring' ? spring : timing).toHaveBeenCalledWith(
        0,
        expect.objectContaining({ reduceMotion: Reanimated.ReduceMotion.Never }),
        expect.any(Function),
      )
    },
  )

  it('settles an active animation when the system setting changes and ignores a stale initial read', async () => {
    let resolveInitial: ((value: boolean) => void) | undefined
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveInitial = resolve
        }),
    )
    let changeSystemSetting: ((value: boolean) => void) | undefined
    const addEventListener = ((event: string, listener: unknown) => {
      if (event === 'reduceMotionChanged') {
        changeSystemSetting = listener as (value: boolean) => void
      }
      return { remove: jest.fn() }
    }) as unknown as typeof AccessibilityInfo.addEventListener
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(addEventListener)
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation(() => 0.4)
    const onTransitionEnd = jest.fn()
    const view = await render(<MotionHarness visible onTransitionEnd={onTransitionEnd} />)

    expect(timing).toHaveBeenCalledTimes(1)
    await act(async () => {
      changeSystemSetting?.(true)
      await Promise.resolve()
    })
    expect(screen.getByTestId('motion-progress').props.children).toBe(1)
    expect(onTransitionEnd.mock.calls).toEqual([[true]])

    await act(async () => {
      resolveInitial?.(false)
      await Promise.resolve()
    })
    await view.rerender(<MotionHarness visible={false} onTransitionEnd={onTransitionEnd} />)

    expect(timing).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('motion-progress').props.children).toBe(0)
    expect(onTransitionEnd.mock.calls).toEqual([[true], [false]])

    await act(async () => {
      changeSystemSetting?.(false)
      await Promise.resolve()
    })
    expect(onTransitionEnd).toHaveBeenCalledTimes(2)
    await view.rerender(<MotionHarness visible onTransitionEnd={onTransitionEnd} />)
    expect(timing).toHaveBeenCalledTimes(2)
  })

  it('continues a rapid direction change from the current transition position', async () => {
    let canceledProgress: Reanimated.SharedValue<number> | undefined
    jest.spyOn(Reanimated, 'cancelAnimation').mockImplementation((value) => {
      canceledProgress = value as Reanimated.SharedValue<number>
    })
    const starts: number[] = []
    const positions = [0.6, 0.35, 0.35]
    jest.spyOn(Reanimated, 'withTiming').mockImplementation(() => {
      starts.push(canceledProgress?.value ?? 0)
      return positions[starts.length - 1]
    })
    const view = await render(<MotionHarness visible type="slide-up" />)

    await view.rerender(<MotionHarness visible={false} type="slide-up" />)
    await view.rerender(<MotionHarness visible type="slide-up" />)

    expect(starts).toEqual([0, 0.6, 0.35])
  })

  it('keeps the public shared progress bounded while a spring transform overshoots', async () => {
    jest.useFakeTimers()
    jest.spyOn(Reanimated, 'withSpring').mockImplementation(() => 1.2)
    const options: UseAnimatedTransitionOptions = {
      visible: true,
      type: 'scale',
      scale: 0.8,
      fade: true,
      overshoot: true,
      entering: { mode: 'spring' },
    }
    const view = await render(<MotionHarness {...options} />)

    await act(async () => jest.advanceTimersByTime(32))
    await view.rerender(<MotionHarness {...options} />)

    expect(screen.getByTestId('motion-progress').props.children).toBe(1)
    const style = StyleSheet.flatten(screen.getByTestId('motion').props.style)
    expect(style.opacity).toBe(1)
    expect(style.transform?.[0]).toHaveProperty('scale', expect.closeTo(1.04))
  })

  it('ignores canceled and stale callbacks after the target changes', async () => {
    const completions: Array<(finished?: boolean) => void> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) completions.push(callback)
      return value
    })
    const onTransitionEnd = jest.fn()
    const view = await render(<MotionHarness visible onTransitionEnd={onTransitionEnd} />)

    await view.rerender(<MotionHarness visible={false} onTransitionEnd={onTransitionEnd} />)
    expect(completions).toHaveLength(2)
    await act(async () => {
      completions[0](true)
      completions[1](false)
      await Promise.resolve()
    })
    expect(onTransitionEnd).not.toHaveBeenCalled()

    await act(async () => {
      completions[1](true)
      await Promise.resolve()
    })
    expect(onTransitionEnd.mock.calls).toEqual([[false]])
  })

  it('does not replay a completed transition when its duration changes', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const onTransitionEnd = jest.fn()
    const view = await render(
      <MotionHarness visible entering={{ duration: 0 }} onTransitionEnd={onTransitionEnd} />,
    )

    await view.rerender(
      <MotionHarness visible entering={{ duration: 360 }} onTransitionEnd={onTransitionEnd} />,
    )

    expect(timing).not.toHaveBeenCalled()
    expect(onTransitionEnd.mock.calls).toEqual([[true]])
    expect(screen.getByTestId('motion-progress').props.children).toBe(1)
  })
})

describe('transition styles', () => {
  it('combines slide and fade and supports a constant slide opacity', () => {
    const transition = {
      type: 'slide-up' as const,
      progress: 0.5,
      distance: 40,
      scale: 0.8,
      opacity: 0.6,
    }

    expect(getTransitionStyle(transition)).toEqual({
      opacity: 0.6,
      transform: [{ translateY: 20 }],
    })
    expect(getTransitionStyle({ ...transition, fade: true })).toEqual({
      opacity: 0.3,
      transform: [{ translateY: 20 }],
    })
  })

  it('allows a spring transform to overshoot while keeping opacity bounded', () => {
    const transition = {
      type: 'scale' as const,
      progress: 1.2,
      distance: 40,
      scale: 0.8,
      fade: true,
    }
    const settled = getTransitionStyle(transition)
    const overshooting = getTransitionStyle({ ...transition, overshoot: true })

    expect(settled).toEqual({ opacity: 1, transform: [{ scale: 1 }] })
    expect(overshooting.opacity).toBe(1)
    expect('transform' in overshooting ? overshooting.transform[0] : undefined).toHaveProperty(
      'scale',
      expect.closeTo(1.04),
    )
    expect(getTransitionStyle({ ...transition, progress: -0.2, overshoot: true }).opacity).toBe(0)
  })
})

describe('web spring preview', () => {
  it('matches the native critical damping branch for a high damping ratio', () => {
    const sample = sampleSpring(100, 0, 1, { damping: 200, stiffness: 100, mass: 1 })

    expect(sample.value).toBeCloseTo(1 - 2 * Math.exp(-1))
    expect(sample.finished).toBe(false)
  })

  it('starts at the current position, overshoots, and settles at its target', () => {
    const config = { damping: 18, stiffness: 220, mass: 1 }

    expect(sampleSpring(0, 0.4, 1, config).value).toBeCloseTo(0.4)
    expect(sampleSpring(300, 0.4, 1, config).value).toBeGreaterThan(1)
    expect(sampleSpring(5000, 0.4, 1, config)).toEqual({ value: 1, finished: true })
  })

  it.each([
    { damping: 20, stiffness: 100, mass: 1 },
    { damping: 40, stiffness: 100, mass: 1 },
  ])('keeps damped preview motion finite and monotonic without overshoot: %p', (config) => {
    const values = [0, 50, 100, 200, 500, 1000, 5000].map(
      (elapsed) => sampleSpring(elapsed, 0, 1, config).value,
    )

    values.forEach((value, index) => {
      expect(Number.isFinite(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(index ? values[index - 1] : 0)
      expect(value).toBeLessThanOrEqual(1)
    })
  })

  it('settles a closing spring at the hidden endpoint', () => {
    expect(sampleSpring(5000, 0.6, 0, { damping: 18, stiffness: 220, mass: 1 })).toEqual({
      value: 0,
      finished: true,
    })
  })
})
