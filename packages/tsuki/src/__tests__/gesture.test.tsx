import { act, render } from '@testing-library/react-native'
import type { PropsWithChildren } from 'react'
import { State } from 'react-native-gesture-handler'
import type { PanGesture } from 'react-native-gesture-handler'
import { View } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { TsukiProvider } from '..'
import { usePanGesture } from '../gesture/pan'
import { useSwipeGesture } from '../gesture/swipe'
import {
  resolveAxisLock,
  resolveGestureDirection,
  resolveNearestSnap,
  resolvePanOffset,
  resolveSwipeTarget,
} from '../gesture/resolve'
import type { PanGestureOptions } from '../gesture/types'
import type { SwipeGestureResult } from '../gesture/types'

const spring = Reanimated.withSpring as jest.Mock
const decay = Reanimated.withDecay as jest.Mock

function GestureWrapper({ children }: PropsWithChildren) {
  return (
    <TsukiProvider scheme="light" theme={{ motion: { reducedMotion: 'never' } }}>
      {children}
    </TsukiProvider>
  )
}

function PanHarness({
  options,
  onGesture,
}: {
  options: PanGestureOptions
  onGesture: (gesture: PanGesture) => void
}) {
  const gesture = usePanGesture(options)
  onGesture(gesture.gesture)
  return <View testID="pan-target" />
}

function SwipeHarness({
  onGesture,
  onOpenChange,
}: {
  onGesture: (gesture: SwipeGestureResult) => void
  onOpenChange: (open: boolean) => void
}) {
  const gesture = useSwipeGesture({
    openValue: 120,
    bounds: { minX: -120, maxX: 120 },
    testID: 'swipe-lifecycle',
    onOpenChange,
  })
  onGesture(gesture)
  return <View testID="swipe-target" />
}

function gestureEvent(
  values: Partial<{
    translationX: number
    translationY: number
    velocityX: number
    velocityY: number
  }> = {},
) {
  return {
    state: State.ACTIVE,
    translationX: 0,
    translationY: 0,
    velocityX: 0,
    velocityY: 0,
    ...values,
  } as Parameters<NonNullable<PanGesture['handlers']['onStart']>>[0]
}

beforeEach(() => {
  spring.mockClear()
  decay.mockClear()
  spring.mockImplementation(
    (target: number, _config: unknown, callback?: (finished: boolean) => void) => {
      callback?.(true)
      return target
    },
  )
  decay.mockImplementation((_config: unknown, callback?: (finished: boolean) => void) => {
    callback?.(true)
    return 0
  })
})

describe('gesture motion resolution', () => {
  it('locks an automatic pan to the axis with the larger initial translation', () => {
    expect(resolveAxisLock('auto', 4, 3, 6, 0)).toBe(0)
    expect(resolveAxisLock('auto', 10, 4, 6, 0)).toBe(1)
    expect(resolveAxisLock('auto', 10, 4, 6, -1)).toBe(-1)
    expect(resolveAxisLock('horizontal', 0, 0, 6, 0)).toBe(1)
    expect(resolveAxisLock('vertical', 0, 0, 6, 0)).toBe(-1)
  })

  it('applies max distance, hard bounds, and configurable resistance', () => {
    expect(
      resolvePanOffset({
        start: 0,
        translation: 100,
        axis: 'horizontal',
        dimension: 'x',
        lockedAxis: 1,
        maxDistance: 60,
      }),
    ).toBe(60)
    expect(
      resolvePanOffset({
        start: 45,
        translation: 20,
        axis: 'horizontal',
        dimension: 'x',
        lockedAxis: 1,
        max: 50,
        resistance: 0.75,
      }),
    ).toBe(53.75)
    expect(
      resolvePanOffset({
        start: 0,
        translation: 30,
        axis: 'horizontal',
        dimension: 'y',
        lockedAxis: 1,
      }),
    ).toBe(0)
  })

  it('resolves snap points from position and projected release velocity', () => {
    expect(resolveNearestSnap(54, [0, 100, 200])).toBe(100)
    expect(resolveSwipeTarget(45, 0, [0, 100], 0, 0.5, 0.2)).toBe(0)
    expect(resolveSwipeTarget(55, 0, [0, 100], 0, 0.5, 0.2)).toBe(100)
    expect(resolveSwipeTarget(0, 1000, [0, 100, 200], 0, 0.5, 0.2)).toBe(200)
    expect(resolveSwipeTarget(100, -500, [0, 100], 100, 0.5, 0.2)).toBe(0)
  })

  it('reports the final direction for each movement axis', () => {
    expect(resolveGestureDirection(-20, 4)).toBe('left')
    expect(resolveGestureDirection(2, 20)).toBe('down')
    expect(resolveGestureDirection(0, 0)).toBeNull()
  })
})

describe('pan gesture lifecycle', () => {
  it('keeps updates on the gesture and reports one release snapshot', async () => {
    const onStateChange = jest.fn()
    const onFinalize = jest.fn()
    let gesture: PanGesture | undefined
    await render(
      <PanHarness
        onGesture={(value) => (gesture = value)}
        options={{
          axis: 'horizontal',
          maxDistance: 40,
          bounds: { minX: -120, maxX: 120 },
          resistance: 0.5,
          snapPoints: [0, 120],
          snapStrategy: 'threshold',
          threshold: 0.5,
          testID: 'pan-lifecycle',
          onStateChange,
          onFinalize,
        }}
      />,
      { wrapper: GestureWrapper },
    )

    expect(gesture).toBeDefined()
    expect(gesture!.handlers.onStart).toBeDefined()
    expect(gesture!.handlers.onEnd).toBeDefined()
    expect(gesture!.handlers.onFinalize).toBeDefined()
    await act(async () => {
      gesture!.handlers.onStart?.(gestureEvent())
      gesture!.handlers.onUpdate?.(
        gestureEvent({ translationX: 20, translationY: 5, velocityX: 300 }),
      )
      gesture!.handlers.onUpdate?.(
        gestureEvent({ translationX: 35, translationY: 10, velocityX: 450 }),
      )
      gesture!.handlers.onEnd?.(
        gestureEvent({ translationX: 35, translationY: 10, velocityX: 450 }),
        true,
      )
      gesture!.handlers.onFinalize?.(
        gestureEvent({ translationX: 35, translationY: 10, velocityX: 450 }),
        true,
      )
      await Promise.resolve()
    })

    expect(onFinalize).toHaveBeenCalledTimes(1)
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'ended',
        direction: 'right',
        translationX: 35,
        velocityX: 450,
        targetX: 120,
      }),
    )
    expect(onStateChange).toHaveBeenCalledWith('active')
    expect(onStateChange).toHaveBeenCalledWith('settling')
    expect(onStateChange).toHaveBeenCalledWith('ended')
    expect(onStateChange).toHaveBeenCalledTimes(3)
  })

  it('restores the stable target and reports cancellation after an active gesture cancels', async () => {
    const onFinalize = jest.fn()
    let gesture: PanGesture | undefined
    await render(
      <PanHarness
        onGesture={(value) => (gesture = value)}
        options={{ axis: 'horizontal', testID: 'pan-cancel', onFinalize }}
      />,
      { wrapper: GestureWrapper },
    )

    expect(gesture).toBeDefined()
    await act(async () => {
      gesture!.handlers.onStart?.(gestureEvent())
      gesture!.handlers.onUpdate?.(gestureEvent({ translationX: 36 }))
      gesture!.handlers.onFinalize?.(gestureEvent({ translationX: 36 }), false)
      await Promise.resolve()
    })

    expect(onFinalize).toHaveBeenCalledTimes(1)
    expect(onFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'cancelled', targetX: 0, translationX: 36 }),
    )
  })

  it('supports Motion decay settling and reports a clamped swipe destination', async () => {
    let gesture: PanGesture | undefined
    const onFinalize = jest.fn()
    await render(
      <PanHarness
        onGesture={(value) => (gesture = value)}
        options={{
          axis: 'horizontal',
          bounds: { minX: 0, maxX: 120 },
          snapPoints: [0, 120],
          snapStrategy: 'threshold',
          settleMode: 'decay',
          testID: 'swipe-decay',
          onFinalize,
        }}
      />,
      { wrapper: GestureWrapper },
    )

    await act(async () => {
      gesture!.handlers.onStart?.(gestureEvent())
      gesture!.handlers.onUpdate?.(gestureEvent({ translationX: 64, velocityX: 700 }))
      gesture!.handlers.onEnd?.(gestureEvent({ translationX: 64, velocityX: 700 }), true)
      gesture!.handlers.onFinalize?.(gestureEvent({ translationX: 64, velocityX: 700 }), true)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(decay).toHaveBeenCalledWith(
      expect.objectContaining({ velocity: 700, clamp: [0, 120], reduceMotion: expect.anything() }),
      expect.any(Function),
    )
    expect(onFinalize).toHaveBeenCalledWith(expect.objectContaining({ targetX: 120 }))
  })

  it('notifies Swipe open changes after programmatic snap completion and deduplicates stable state', async () => {
    let gesture: SwipeGestureResult | undefined
    const onOpenChange = jest.fn()
    await render(
      <SwipeHarness onGesture={(value) => (gesture = value)} onOpenChange={onOpenChange} />,
      { wrapper: GestureWrapper },
    )

    await act(async () => {
      gesture!.open()
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(gesture!.isOpen.get()).toBe(true)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    await act(async () => {
      gesture!.open()
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(onOpenChange).toHaveBeenCalledTimes(1)

    await act(async () => {
      gesture!.close()
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(gesture!.isOpen.get()).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })
})
