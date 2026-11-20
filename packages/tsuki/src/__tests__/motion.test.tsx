import { act, render, renderHook } from '@testing-library/react-native'
import type { PropsWithChildren } from 'react'
import { AccessibilityInfo, Text } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { ReduceMotion, withSpring, withTiming } from 'react-native-reanimated'
import type { EmitterSubscription } from 'react-native/Libraries/vendor/emitter/EventEmitter'
import { ConfigProvider, TsukiProvider, useTsukiTheme } from '..'
import { getDefaultTheme } from '../theme/defaults'
import { mergeTheme } from '../theme/merge-theme'
import { serializeTheme } from '../theme/serialize-theme'
import type { ResolvedTheme } from '../theme/types'
import { createMotionAnimation, createMotionDecay, scaleSpringConfig } from '../motion/animation'
import { MOTION_PRESETS } from '../motion/presets'
import { useMotionConfig } from '../motion/useMotionConfig'
import { useMotionValue } from '../motion/useMotionValue'
import { useReducedMotion } from '../motion/useReducedMotion'
import { useTransitionProgress } from '../motion/useTransitionProgress'

type ReduceMotionListener = (enabled: boolean) => void
type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void }

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function createMotionWrapper(motion: ResolvedTheme['motion']) {
  return function MotionWrapper({ children }: PropsWithChildren) {
    return (
      <TsukiProvider scheme="light" theme={{ motion }}>
        {children}
      </TsukiProvider>
    )
  }
}

let reduceMotionListener: ReduceMotionListener | undefined
let removeAccessibilityListener: jest.Mock
let queryMotionState: jest.Mock
let addAccessibilityListener: jest.SpyInstance
const activeAccessibilitySubscriptions = new Set<EmitterSubscription>()
const timingMock = withTiming as jest.Mock
const springMock = withSpring as jest.Mock
let decayMock: jest.SpyInstance
let delayMock: jest.SpyInstance

function mockAccessibility(initialState: Promise<boolean> = Promise.resolve(false)) {
  reduceMotionListener = undefined
  removeAccessibilityListener = jest.fn()
  queryMotionState = jest.fn(() => initialState)
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockImplementation(queryMotionState)
  addAccessibilityListener = jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((
    eventName: string,
    listener: ReduceMotionListener,
  ) => {
    if (eventName === 'reduceMotionChanged') reduceMotionListener = listener
    let subscription: EmitterSubscription
    const remove = jest.fn(() => {
      activeAccessibilitySubscriptions.delete(subscription)
      removeAccessibilityListener()
    })
    subscription = { remove } as unknown as EmitterSubscription
    activeAccessibilitySubscriptions.add(subscription)
    return subscription
  }) as typeof AccessibilityInfo.addEventListener)
  addAccessibilityListener.mockClear()
}

function completeAnimationsByDefault() {
  timingMock.mockImplementation(
    (target: number, _config: unknown, callback?: (finished: boolean) => void) => {
      callback?.(true)
      return target
    },
  )
  springMock.mockImplementation(
    (target: number, _config: unknown, callback?: (finished: boolean) => void) => {
      callback?.(true)
      return target
    },
  )
}

async function flushMotionQuery() {
  await act(async () => {
    await Promise.resolve()
  })
}

beforeEach(() => {
  mockAccessibility()
  completeAnimationsByDefault()
  decayMock = jest.spyOn(Reanimated, 'withDecay')
  decayMock.mockImplementation((_config: unknown, callback?: (finished: boolean) => void) => {
    callback?.(true)
    return 0
  })
  delayMock = jest.spyOn(Reanimated, 'withDelay')
})

afterEach(() => {
  jest.restoreAllMocks()
  timingMock.mockReset()
  springMock.mockReset()
  reduceMotionListener = undefined
})

describe('Motion Theme policy', () => {
  it('provides defaults and merges nested Motion policy by field', async () => {
    expect(getDefaultTheme('light').motion).toEqual({
      enabled: true,
      reducedMotion: 'system',
      durationScale: 1,
    })

    let parentTheme: ResolvedTheme | undefined
    let childTheme: ResolvedTheme | undefined
    let grandchildTheme: ResolvedTheme | undefined
    const ThemeProbe = ({ capture }: { capture: (theme: ResolvedTheme) => void }) => {
      capture(useTsukiTheme())
      return <Text>Theme</Text>
    }

    await render(
      <TsukiProvider
        scheme="light"
        theme={{ motion: { reducedMotion: 'never', durationScale: 2 } }}
      >
        <ThemeProbe capture={(theme) => (parentTheme = theme)} />
        <ConfigProvider theme={{ motion: { enabled: false } }}>
          <ThemeProbe capture={(theme) => (childTheme = theme)} />
          <ConfigProvider theme={{ motion: { durationScale: 0.5 } }}>
            <ThemeProbe capture={(theme) => (grandchildTheme = theme)} />
          </ConfigProvider>
        </ConfigProvider>
      </TsukiProvider>,
    )

    expect(parentTheme?.motion).toEqual({ enabled: true, reducedMotion: 'never', durationScale: 2 })
    expect(childTheme?.motion).toEqual({ enabled: false, reducedMotion: 'never', durationScale: 2 })
    expect(grandchildTheme?.motion).toEqual({
      enabled: false,
      reducedMotion: 'never',
      durationScale: 0.5,
    })
  })

  it('resets Motion policy on inherit=false before applying local values', () => {
    const inherited = mergeTheme(getDefaultTheme('dark'), {
      motion: { enabled: false, reducedMotion: 'always', durationScale: 4 },
    })
    const reset = mergeTheme(inherited, { inherit: false, motion: { durationScale: 0 } })

    expect(reset.motion).toEqual({ enabled: true, reducedMotion: 'system', durationScale: 0 })
  })

  it('accepts positive and zero duration scales and falls back for invalid scales', () => {
    const parent = mergeTheme(getDefaultTheme('light'), { motion: { durationScale: 2 } })
    expect(mergeTheme(parent, { motion: { durationScale: 0.25 } }).motion.durationScale).toBe(0.25)
    expect(mergeTheme(parent, { motion: { durationScale: 0 } }).motion.durationScale).toBe(0)

    for (const durationScale of [
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      '2' as unknown as number,
    ]) {
      expect(mergeTheme(parent, { motion: { durationScale } }).motion.durationScale).toBe(2)
    }
  })

  it('does not serialize Motion policy', () => {
    const theme = mergeTheme(getDefaultTheme('light'), {
      motion: { enabled: false, reducedMotion: 'always', durationScale: 0.2 },
    })
    const variables = serializeTheme(theme)

    expect(Object.keys(variables).some((key) => key.includes('motion'))).toBe(false)
    expect(Object.values(variables)).not.toContain('always')
  })
})

describe('Motion animation primitives', () => {
  it('scales spring timing while preserving the damping ratio', () => {
    const base = scaleSpringConfig(undefined, 1)
    const scaled = scaleSpringConfig(undefined, 2)
    const dampingRatio = (config: { damping?: number; mass?: number; stiffness?: number }) =>
      (config.damping ?? 0) / (2 * Math.sqrt((config.stiffness ?? 0) * (config.mass ?? 0)))

    expect(scaled.stiffness).toBeCloseTo((base.stiffness ?? 0) / 4)
    expect(scaled.damping).toBeCloseTo((base.damping ?? 0) / 2)
    expect(scaled.mass).toBe(base.mass)
    expect(dampingRatio(scaled)).toBeCloseTo(dampingRatio(base))
    expect(scaleSpringConfig({ duration: 500, dampingRatio: 0.8 }, 2)).toMatchObject({
      duration: 1000,
      dampingRatio: 0.8,
    })
    expect(scaleSpringConfig({ dampingRatio: 0.8 }, 2)).toMatchObject({ duration: 1100 })
  })

  it('provides all architecture presets without fixed component durations', () => {
    expect(Object.keys(MOTION_PRESETS)).toEqual([
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
    ])
    expect(MOTION_PRESETS['spring-scale'].animation).toBe('spring')
    expect(MOTION_PRESETS['fade-up'].enter.from).toMatchObject({ opacity: 0, translateY: 1 })
    expect(MOTION_PRESETS['slide-down'].enter.from).toEqual({ translateY: -1 })
  })

  it('scales Delay and builds Decay with app-owned Reduced Motion policy', () => {
    createMotionAnimation(1, { duration: 300, delay: 40 }, 2, jest.fn())
    expect(timingMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 600 }),
      expect.any(Function),
    )
    expect(delayMock).toHaveBeenCalledWith(80, 1, ReduceMotion.Never)

    createMotionDecay({ velocity: 3, delay: 25 }, 2, jest.fn())
    expect(decayMock).toHaveBeenCalledWith(
      expect.objectContaining({ velocity: 3, reduceMotion: ReduceMotion.Never }),
      expect.any(Function),
    )
    expect(delayMock).toHaveBeenLastCalledWith(50, 0, ReduceMotion.Never)
  })

  it('calls Timing and Spring completion callbacks once after completion', async () => {
    const onTimingComplete = jest.fn()
    const onSpringComplete = jest.fn()
    const onDecayComplete = jest.fn()
    const { result } = await renderHook(() => useMotionValue(0), {
      wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'never', durationScale: 1 }),
    })

    await act(() => result.current.animateTo(1, { duration: 200 }, onTimingComplete))
    expect(onTimingComplete).toHaveBeenCalledTimes(1)
    expect(onTimingComplete).toHaveBeenCalledWith(true)

    await act(() => result.current.animateTo(0, { type: 'spring' }, onSpringComplete))
    expect(onSpringComplete).toHaveBeenCalledTimes(1)
    expect(onSpringComplete).toHaveBeenCalledWith(true)
    await act(() => result.current.decay({ velocity: 2 }, onDecayComplete))
    expect(onDecayComplete).toHaveBeenCalledTimes(1)
    expect(onDecayComplete).toHaveBeenCalledWith(true)
    expect(timingMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 200 }),
      expect.any(Function),
    )
    expect(springMock).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ reduceMotion: ReduceMotion.Never }),
      expect.any(Function),
    )
    expect(decayMock).toHaveBeenCalledWith(
      expect.objectContaining({ velocity: 2, reduceMotion: ReduceMotion.Never }),
      expect.any(Function),
    )
  })

  it('takes over the same SharedValue when a transition reverses', async () => {
    let timingCallback: ((finished: boolean) => void) | undefined
    timingMock.mockImplementation(
      (target: number, _config: unknown, callback?: (finished: boolean) => void) => {
        timingCallback = callback
        return target
      },
    )
    const { result } = await renderHook(() => useMotionValue(0), {
      wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'never', durationScale: 1 }),
    })
    const sharedValue = result.current.value

    await act(() => result.current.value.set(0.4))
    await act(() => result.current.animateTo(1))
    await act(() => result.current.animateTo(0))

    expect(result.current.value).toBe(sharedValue)
    expect(timingMock).toHaveBeenLastCalledWith(0, expect.any(Object), expect.any(Function))
    timingCallback?.(true)
  })

  it('completes immediately at scale zero and invalidates canceled animation callbacks', async () => {
    const immediateComplete = jest.fn()
    const { result: immediateResult, unmount: unmountImmediate } = await renderHook(
      () => useMotionValue(0),
      {
        wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'never', durationScale: 0 }),
      },
    )

    await act(() => immediateResult.current.animateTo(1, undefined, immediateComplete))
    expect(immediateResult.current.value.get()).toBe(1)
    expect(immediateComplete).toHaveBeenCalledTimes(1)
    expect(timingMock).not.toHaveBeenCalled()
    await unmountImmediate()

    const disabledComplete = jest.fn()
    const { result: disabledResult, unmount: unmountDisabled } = await renderHook(
      () => useMotionValue(0),
      {
        wrapper: createMotionWrapper({ enabled: false, reducedMotion: 'never', durationScale: 1 }),
      },
    )
    await act(() => disabledResult.current.animateTo(2, undefined, disabledComplete))
    expect(disabledResult.current.value.get()).toBe(2)
    expect(disabledComplete).toHaveBeenCalledTimes(1)
    expect(timingMock).not.toHaveBeenCalled()
    await unmountDisabled()

    let staleCallback: ((finished: boolean) => void) | undefined
    timingMock.mockImplementation(
      (target: number, _config: unknown, callback?: (finished: boolean) => void) => {
        staleCallback = callback
        return target
      },
    )
    const onCanceledComplete = jest.fn()
    const { result: activeResult, unmount: unmountActive } = await renderHook(
      () => useMotionValue(0),
      {
        wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'never', durationScale: 1 }),
      },
    )

    await act(() => activeResult.current.animateTo(1, undefined, onCanceledComplete))
    await act(() => activeResult.current.cancel())
    await act(() => staleCallback?.(true))

    expect(onCanceledComplete).not.toHaveBeenCalled()
    await unmountActive()
  })

  it('cancels active motion on unmount and ignores its queued completion', async () => {
    let pendingCallback: ((finished: boolean) => void) | undefined
    timingMock.mockImplementation(
      (target: number, _config: unknown, callback?: (finished: boolean) => void) => {
        pendingCallback = callback
        return target
      },
    )
    const onComplete = jest.fn()
    const utils = await renderHook(() => useMotionValue(0), {
      wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'never', durationScale: 1 }),
    })
    await act(() => utils.result.current.animateTo(1, undefined, onComplete))

    await utils.unmount()
    await act(() => pendingCallback?.(true))
    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('Reduced Motion subscription', () => {
  it('uses the initial system state and follows live setting changes', async () => {
    const initialQuery = deferred<boolean>()
    mockAccessibility(initialQuery.promise)
    const utils = await renderHook(() => useMotionConfig(), {
      wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'system', durationScale: 1 }),
    })

    expect(utils.result.current.shouldAnimate).toBe(true)
    await act(async () => {
      initialQuery.resolve(true)
      await initialQuery.promise
    })
    await flushMotionQuery()
    expect(utils.result.current.shouldReduceMotion).toBe(true)
    expect(utils.result.current.shouldAnimate).toBe(false)

    await act(() => reduceMotionListener?.(false))
    expect(utils.result.current.shouldAnimate).toBe(true)
    await act(() => reduceMotionListener?.(true))
    expect(utils.result.current.shouldAnimate).toBe(false)
    await utils.unmount()
  })

  it('lets an event win when it arrives before the initial query resolves', async () => {
    const initialQuery = deferred<boolean>()
    mockAccessibility(initialQuery.promise)
    const utils = await renderHook(() => useReducedMotion())

    await act(() => reduceMotionListener?.(true))
    await act(async () => {
      initialQuery.resolve(false)
      await initialQuery.promise
    })

    expect(utils.result.current).toBe(true)
    expect(queryMotionState).toHaveBeenCalledTimes(1)
    await utils.unmount()
  })

  it('shares one native listener and query across consumers, then cleans them up', async () => {
    expect(activeAccessibilitySubscriptions.size).toBe(0)
    const { unmount: unmountFirst } = await renderHook(() => useReducedMotion())
    expect(activeAccessibilitySubscriptions.size).toBe(1)
    const callsAfterFirstConsumer = addAccessibilityListener.mock.calls.length
    const queriesAfterFirstConsumer = queryMotionState.mock.calls.length
    const { unmount: unmountSecond } = await renderHook(() => useReducedMotion())

    expect(activeAccessibilitySubscriptions.size).toBe(1)
    expect(addAccessibilityListener).toHaveBeenCalledTimes(callsAfterFirstConsumer)
    expect(queryMotionState).toHaveBeenCalledTimes(queriesAfterFirstConsumer)

    await unmountFirst()
    expect(removeAccessibilityListener).not.toHaveBeenCalled()
    await unmountSecond()
    expect(activeAccessibilitySubscriptions.size).toBe(0)
    expect(removeAccessibilityListener).toHaveBeenCalled()
  })

  it('immediately finishes active transitions when system Reduced Motion turns on', async () => {
    let animationCallback: ((finished: boolean) => void) | undefined
    timingMock.mockImplementation(
      (target: number, _config: unknown, callback?: (finished: boolean) => void) => {
        animationCallback = callback
        return target
      },
    )
    const onComplete = jest.fn()
    const utils = await renderHook(() => useMotionValue(0), {
      wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'system', durationScale: 1 }),
    })

    await act(() => utils.result.current.animateTo(1, undefined, onComplete))
    await act(() => reduceMotionListener?.(true))

    expect(utils.result.current.value.get()).toBe(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(true)

    await act(() => animationCallback?.(true))
    expect(onComplete).toHaveBeenCalledTimes(1)
    await utils.unmount()
  })

  it('does not replay a completed transition when system Reduced Motion turns off', async () => {
    const utils = await renderHook(
      ({ visible }: { visible: boolean }) => useTransitionProgress(visible),
      {
        initialProps: { visible: false },
        wrapper: createMotionWrapper({ enabled: true, reducedMotion: 'system', durationScale: 1 }),
      },
    )
    await flushMotionQuery()

    expect(timingMock).not.toHaveBeenCalled()
    await utils.rerender({ visible: true })
    const initialCalls = timingMock.mock.calls.length
    expect(initialCalls).toBe(1)

    await act(() => reduceMotionListener?.(true))
    await act(() => reduceMotionListener?.(false))

    expect(timingMock).toHaveBeenCalledTimes(initialCalls)
    expect(utils.result.current.get()).toBe(1)
    await utils.unmount()
  })

  it('removes the native listener when the final subscriber unmounts', async () => {
    expect(activeAccessibilitySubscriptions.size).toBe(0)
    const utils = await renderHook(() => useReducedMotion())
    expect(activeAccessibilitySubscriptions.size).toBe(1)
    await utils.unmount()
    expect(activeAccessibilitySubscriptions.size).toBe(0)
    expect(removeAccessibilityListener).toHaveBeenCalled()
  })
})
