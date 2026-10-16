import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Gesture } from '../gesture'
import { useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { sliderValueAtPosition } from './value'
import type { GestureResponderEvent } from 'react-native'

interface SliderGestureOptions {
  value: number
  min: number
  max: number
  step: number
  width: number
  offset: number
  reverse: boolean
  enabled: boolean
  testID?: string
  onChange: (value: number) => void
  onComplete: (value: number) => void
}

export function useSliderGesture(options: SliderGestureOptions) {
  const { value, min, max, step, width, offset, reverse, enabled, testID } = options
  const position = useSharedValue(value)
  const initial = useSharedValue(value)
  const [dragging, setDragging] = useState(false)
  const latest = useRef(options)
  latest.current = options
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    position.value = value
  }, [value, position])

  const notify = useCallback((next: number) => {
    if (mounted.current && latest.current.enabled) latest.current.onChange(next)
  }, [])
  const start = useCallback(() => {
    if (mounted.current) setDragging(true)
  }, [])
  const finish = useCallback(
    (next: number, changed: boolean, success: boolean) => {
      if (!mounted.current) return
      setDragging(false)
      if (success && changed && latest.current.enabled) latest.current.onComplete(next)
      position.value = latest.current.value
    },
    [position],
  )

  const gesture = useMemo(() => {
    const update = (x: number) => {
      'worklet'
      const next = sliderValueAtPosition(x, width, offset, min, max, step, reverse)
      if (next !== position.value) {
        position.value = next
        scheduleOnRN(notify, next)
      }
    }
    const pan = Gesture.Pan()
      .enabled(enabled && width > 0 && max > min)
      .activeOffsetX([-3, 3])
      .failOffsetY([-6, 6])
      .withTestId(`${testID ?? 'slider'}-pan`)
      .onStart((event) => {
        'worklet'
        initial.value = position.value
        scheduleOnRN(start)
        update(event.x)
      })
      .onUpdate((event) => {
        'worklet'
        update(event.x)
      })
      .onFinalize((_, success) => {
        'worklet'
        scheduleOnRN(finish, position.value, position.value !== initial.value, success)
      })
    const tap = Gesture.Tap()
      .enabled(enabled && width > 0 && max > min)
      .withTestId(`${testID ?? 'slider'}-tap`)
      .onEnd((event, success) => {
        'worklet'
        if (!success) return
        const previous = position.value
        update(event.x)
        scheduleOnRN(finish, position.value, previous !== position.value, true)
      })
    return Gesture.Race(pan, tap)
  }, [
    enabled,
    width,
    offset,
    max,
    min,
    reverse,
    step,
    position,
    initial,
    notify,
    start,
    finish,
    testID,
  ])
  // Dumi's static Reanimated adapter needs React updates and RN responder input.
  const staticAdapter = '__tsukiStaticAdapter' in position
  const updateStatic = (event: GestureResponderEvent) => {
    if (!enabled || width <= 0 || max <= min) return
    const next = sliderValueAtPosition(
      event.nativeEvent.locationX,
      width,
      offset,
      min,
      max,
      step,
      reverse,
    )
    if (next !== position.value) {
      position.value = next
      notify(next)
    }
  }
  const responderHandlers = staticAdapter
    ? {
        onStartShouldSetResponder: () => enabled && width > 0 && max > min,
        onResponderGrant: (event: GestureResponderEvent) => {
          initial.value = position.value
          start()
          updateStatic(event)
        },
        onResponderMove: updateStatic,
        onResponderRelease: (event: GestureResponderEvent) => {
          updateStatic(event)
          finish(position.value, position.value !== initial.value, true)
        },
        onResponderTerminate: () => finish(position.value, false, false),
        onResponderTerminationRequest: () => false,
      }
    : {}
  return { gesture, position, dragging, staticAdapter, responderHandlers }
}
