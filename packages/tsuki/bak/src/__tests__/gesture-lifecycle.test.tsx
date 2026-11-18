import { act, cleanup, render } from '@testing-library/react-native'
import { View } from 'react-native'
import { GestureDetector, PointerType, State } from 'react-native-gesture-handler'
import { fireGestureHandler } from 'react-native-gesture-handler/jest-utils'
import * as Reanimated from 'react-native-reanimated'
import * as Worklets from 'react-native-worklets'
import { ConfigProvider } from '../theme'
import { usePanGesture, useSwipeGesture, useTapGesture } from '../gesture'
import type {
  PanGestureEndEvent,
  UsePanGestureOptions,
  UsePanGestureResult,
  UseSwipeGestureOptions,
  UseSwipeGestureResult,
  UseTapGestureOptions,
  UseTapGestureResult,
} from '../gesture'

let pan: UsePanGestureResult
let swipe: UseSwipeGestureResult
let tap: UseTapGestureResult
function Pan({ options }: { options: UsePanGestureOptions }) {
  pan = usePanGesture(options)
  return (
    <GestureDetector gesture={pan.gesture}>
      <View />
    </GestureDetector>
  )
}
function Swipe({ options }: { options: UseSwipeGestureOptions }) {
  swipe = useSwipeGesture(options)
  return (
    <GestureDetector gesture={swipe.gesture}>
      <View />
    </GestureDetector>
  )
}
function Tap({ options }: { options: UseTapGestureOptions }) {
  tap = useTapGesture(options)
  return (
    <GestureDetector gesture={tap.gesture}>
      <View />
    </GestureDetector>
  )
}
function Still({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={{ motion: { enabled: false } }}>{children}</ConfigProvider>
}
const event = (translationX = 0, translationY = 0): PanGestureEndEvent => ({
  handlerTag: 0,
  numberOfPointers: 1,
  state: State.ACTIVE,
  oldState: State.BEGAN,
  pointerType: PointerType.TOUCH,
  x: 0,
  y: 0,
  absoluteX: 0,
  absoluteY: 0,
  translationX,
  translationY,
  velocityX: 0,
  velocityY: 0,
})

beforeEach(() => {
  jest.spyOn(Worklets, 'scheduleOnUI').mockImplementation((fn, ...args) => {
    fn(...args)
  })
})
afterEach(async () => {
  await cleanup()
  jest.restoreAllMocks()
})

describe('Pan lifecycle', () => {
  it('reports the release snapshot on RN and keeps the legacy end ordering', async () => {
    const onFinalize = jest.fn()
    const positions: number[] = []
    await render(
      <Still>
        <Pan
          options={{
            direction: 'horizontal',
            maxDistance: 80,
            onFinalize,
            onEnd: (_event, _success, values) => positions.push(values.translateX.value),
          }}
        />
      </Still>,
    )
    await act(async () => {
      fireGestureHandler(pan.gesture, [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { translationX: 120 },
        { state: State.END, translationX: 120 },
      ])
    })
    expect(positions).toEqual([80])
    expect(pan.translateX.value).toBe(0)
    expect(onFinalize).toHaveBeenCalledTimes(1)
    expect(onFinalize).toHaveBeenCalledWith({ canceled: false, translateX: 80, translateY: 0 })
  })

  it.each([true, false])('cleans up active cancellation with springBack=%s', async (springBack) => {
    const onFinalize = jest.fn()
    await render(
      <Still>
        <Pan options={{ direction: 'vertical', springBack, onFinalize }} />
      </Still>,
    )
    await act(async () =>
      fireGestureHandler(pan.gesture, [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { translationY: -50 },
        { state: State.CANCELLED, translationY: -50 },
      ]),
    )
    expect(pan.translateY.value).toBe(springBack ? 0 : -50)
    expect(onFinalize).toHaveBeenCalledTimes(1)
    expect(onFinalize).toHaveBeenCalledWith({ canceled: true, translateX: 0, translateY: -50 })
  })

  it('ignores failure before activation', async () => {
    const onEnd = jest.fn()
    const onFinalize = jest.fn()
    await render(
      <Still>
        <Pan options={{ direction: 'horizontal', onEnd, onFinalize }} />
      </Still>,
    )
    await act(async () =>
      pan.gesture.handlers.onFinalize?.({ ...event(), state: State.FAILED }, false),
    )
    expect(onEnd).not.toHaveBeenCalled()
    expect(onFinalize).not.toHaveBeenCalled()
  })

  it('cancels an active drag once when disabled and ignores the old native finalize', async () => {
    const onFinalize = jest.fn()
    const tree = (enabled: boolean) => (
      <Still>
        <Pan options={{ direction: 'horizontal', enabled, onFinalize }} />
      </Still>
    )
    const view = await render(tree(true))
    const old = pan.gesture
    await act(async () => {
      old.handlers.onStart?.(event())
      old.handlers.onUpdate?.(event(45))
    })
    await view.rerender(tree(false))
    await act(async () => old.handlers.onFinalize?.(event(45), false))
    expect(pan.translateX.value).toBe(0)
    expect(onFinalize).toHaveBeenCalledTimes(1)
    expect(onFinalize).toHaveBeenCalledWith({ canceled: true, translateX: 45, translateY: 0 })
  })

  it('clamps a retained position after shrinking bounds and clears the old axis', async () => {
    const tree = (direction: 'horizontal' | 'vertical', maxDistance: number) => (
      <Still>
        <Pan options={{ direction, maxDistance, springBack: false }} />
      </Still>
    )
    const view = await render(tree('horizontal', 120))
    await act(async () =>
      fireGestureHandler(pan.gesture, [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { translationX: 100 },
        { state: State.END, translationX: 100 },
      ]),
    )
    expect(pan.translateX.value).toBe(100)
    await view.rerender(tree('horizontal', 40))
    expect(pan.translateX.value).toBe(40)
    await view.rerender(tree('vertical', 40))
    expect(pan.translateX.value).toBe(0)
    expect(pan.translateY.value).toBe(0)
  })

  it('continues spring-back after bounds change while dragging', async () => {
    const onFinalize = jest.fn()
    const tree = (maxDistance: number) => (
      <Still>
        <Pan options={{ direction: 'horizontal', maxDistance, onFinalize }} />
      </Still>
    )
    const view = await render(tree(120))
    await act(async () => {
      pan.gesture.handlers.onStart?.(event())
      pan.gesture.handlers.onUpdate?.(event(80))
    })
    await view.rerender(tree(40))
    expect(pan.translateX.value).toBe(0)
    expect(onFinalize).toHaveBeenCalledWith({ canceled: true, translateX: 80, translateY: 0 })
  })

  it('cancels settling before capturing the next drag origin', async () => {
    const cancel = jest.spyOn(Reanimated, 'cancelAnimation')
    await render(
      <Still>
        <Pan options={{ direction: 'horizontal', springBack: false }} />
      </Still>,
    )
    await act(async () => {
      pan.translateX.value = 25
      pan.gesture.handlers.onStart?.(event())
    })
    expect(cancel).toHaveBeenCalledWith(pan.translateX)
    await act(async () => pan.gesture.handlers.onUpdate?.(event(10)))
    expect(pan.translateX.value).toBe(35)
  })
})

describe('Swipe settling', () => {
  it.each(['left', 'right'] as const)(
    'restores the stable %s target after cancellation',
    async (direction) => {
      const onOpenChange = jest.fn()
      await render(
        <Still>
          <Swipe options={{ direction, maxDistance: 120, snapPoint: 60, onOpenChange }} />
        </Still>,
      )
      await act(async () => swipe.open())
      expect(swipe.translateX.value).toBe(direction === 'left' ? -60 : 60)
      expect(onOpenChange).toHaveBeenCalledWith(true)
      await act(async () =>
        fireGestureHandler(swipe.gesture, [
          { state: State.BEGAN },
          { state: State.ACTIVE },
          { translationX: direction === 'left' ? 30 : -30 },
          { state: State.CANCELLED },
        ]),
      )
      expect(swipe.translateX.value).toBe(direction === 'left' ? -60 : 60)
      expect(onOpenChange).toHaveBeenCalledTimes(1)
      await act(async () => {
        swipe.close()
        swipe.close()
      })
      expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    },
  )

  it.each([
    { distance: 70, velocity: 0, target: 120 },
    { distance: 10, velocity: 600, target: 120 },
    { distance: 90, velocity: -600, target: 0 },
    { distance: -60, velocity: 0, target: 0 },
  ])('preserves distance and velocity decisions for %j', async ({ distance, velocity, target }) => {
    await render(
      <Still>
        <Swipe options={{ maxDistance: 120 }} />
      </Still>,
    )
    await act(async () =>
      fireGestureHandler(swipe.gesture, [
        { state: State.BEGAN },
        { state: State.ACTIVE },
        { translationX: distance },
        { state: State.END, translationX: distance, velocityX: velocity },
      ]),
    )
    expect(swipe.translateX.value).toBe(target)
  })

  it('keeps programmatic control while disabled and reconciles changed targets', async () => {
    const onOpenChange = jest.fn()
    const tree = (maxDistance: number, direction: 'left' | 'right' = 'right') => (
      <Still>
        <Swipe options={{ maxDistance, direction, enabled: false, onOpenChange }} />
      </Still>
    )
    const view = await render(tree(120))
    await act(async () => swipe.open())
    await view.rerender(tree(40, 'left'))
    expect(swipe.translateX.value).toBe(-40)
    await view.rerender(tree(0))
    expect(swipe.translateX.value).toBe(0)
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('cancels a drag when direction changes instead of competing with new settling', async () => {
    const tree = (direction: 'left' | 'right') => (
      <Still>
        <Swipe options={{ direction, maxDistance: 120 }} />
      </Still>
    )
    const view = await render(tree('right'))
    const old = swipe.gesture
    await act(async () => {
      old.handlers.onStart?.(event())
      old.handlers.onUpdate?.(event(30))
    })
    await view.rerender(tree('left'))
    expect(swipe.translateX.value).toBe(0)
    await act(async () => old.handlers.onUpdate?.(event(80)))
    expect(swipe.translateX.value).toBe(0)
  })

  it('rejects stale and already queued completions after reversal and unmount', async () => {
    const completions: Array<(finished?: boolean) => void> = []
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((value, _config, callback) => {
      if (callback) completions.push(callback)
      return value
    })
    const onOpenChange = jest.fn()
    const view = await render(<Swipe options={{ maxDistance: 120, onOpenChange }} />)
    await act(async () => swipe.open())
    await act(async () => {
      completions[0](true)
      swipe.close()
      await Promise.resolve()
    })
    expect(onOpenChange).not.toHaveBeenCalled()
    await act(async () => completions[1](true))
    expect(onOpenChange).not.toHaveBeenCalled()
    await act(async () => swipe.open())
    await view.unmount()
    await act(async () => completions[2](true))
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe('Tap lifecycle', () => {
  it.each([NaN, Infinity, -2, 0, 1.8])('normalizes invalid tap counts %s', async (numberOfTaps) => {
    await render(<Tap options={{ numberOfTaps }} />)
    expect(tap.gesture.config.numberOfTaps).toBe(1)
  })

  it('clears pressed after failure and invokes the RN callback only on success', async () => {
    const onPress = jest.fn()
    await render(<Tap options={{ onPress }} />)
    await act(async () =>
      fireGestureHandler(tap.gesture, [{ state: State.BEGAN }, { state: State.FAILED }]),
    )
    expect(tap.pressed.value).toBe(false)
    expect(onPress).not.toHaveBeenCalled()
    await act(async () => fireGestureHandler(tap.gesture))
    expect(tap.pressed.value).toBe(false)
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
