import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import type { View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useTransitionProgressState } from './useTransitionProgress'
import { transitionPresets } from './effects'
import type { TransitionProps } from './types'

export const Transition = forwardRef<View, TransitionProps>(function Transition(
  {
    visible,
    name = 'fade',
    duration,
    enterDuration,
    exitDuration,
    delay = 0,
    appear = true,
    unmountOnExit = false,
    motion = true,
    onEnter,
    onEntered,
    onExit,
    onExited,
    onLayout,
    style,
    ...props
  },
  ref,
) {
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'entered' | 'exiting'>(
    visible ? (appear ? 'entering' : 'entered') : 'hidden',
  )
  const [size, setSize] = useState<{ width: number; height: number }>()
  const previous = useRef<boolean | undefined>(undefined)
  const pendingExit = useRef(false)
  const currentVisible = useRef(visible)
  currentVisible.current = visible
  const callbacks = useRef({ onEnter, onEntered, onExit, onExited })
  callbacks.current = { onEnter, onEntered, onExit, onExited }

  useLayoutEffect(() => {
    if (previous.current === visible) return
    const wasVisible = previous.current
    previous.current = visible
    if (visible) {
      pendingExit.current = false
      setPhase('entering')
      callbacks.current.onEnter?.()
    } else if (wasVisible === true) {
      pendingExit.current = true
      setPhase('exiting')
      callbacks.current.onExit?.()
    }
  }, [visible])

  const preset = transitionPresets[name]
  const isSlide = name.startsWith('slide-')
  const ready = !isSlide || size !== undefined
  const distance = isSlide
    ? name === 'slide-up' || name === 'slide-down'
      ? (size?.height ?? 0)
      : (size?.width ?? 0)
    : preset.distance
  const { animatedStyle } = useTransitionProgressState(
    {
      visible,
      preset,
      distance,
      motion,
      appear,
      delay: Math.max(0, delay),
      entering:
        enterDuration === undefined && duration === undefined
          ? undefined
          : { duration: enterDuration ?? duration },
      leaving:
        exitDuration === undefined && duration === undefined
          ? undefined
          : { duration: exitDuration ?? duration },
      onTransitionEnd: (entered) => {
        if (currentVisible.current !== entered) return
        setPhase(entered ? 'entered' : 'hidden')
        if (!entered && unmountOnExit) setSize(undefined)
        if (entered) callbacks.current.onEntered?.()
        else if (pendingExit.current) {
          pendingExit.current = false
          callbacks.current.onExited?.()
        }
      },
    },
    ready,
  )

  if (!visible && phase === 'hidden' && unmountOnExit) return null
  return (
    <Animated.View
      {...props}
      ref={ref}
      pointerEvents={visible && ready ? props.pointerEvents : 'none'}
      accessibilityElementsHidden={!visible || !ready || props.accessibilityElementsHidden}
      importantForAccessibility={
        visible && ready ? props.importantForAccessibility : 'no-hide-descendants'
      }
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout
        setSize((previousSize) =>
          previousSize?.width === width && previousSize.height === height
            ? previousSize
            : { width, height },
        )
        onLayout?.(event)
      }}
      style={[
        style,
        animatedStyle,
        !ready || (phase === 'hidden' && !visible) ? { opacity: 0 } : undefined,
      ]}
    />
  )
})
Transition.displayName = 'Transition'
