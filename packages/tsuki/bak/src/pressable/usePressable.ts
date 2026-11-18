import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { SwipeCellPressContext } from '../swipe-cell/context'
import { useSwipeCellPress } from '../swipe-cell/useSwipeCellPress'
import { usePressHandler } from './usePressHandler'
import type { PressableProps, PressableState } from './types'

interface PressableOptions extends PressableProps {
  /** Private synchronous visual bridge; never forwarded to the native host. */
  onPressFeedbackChange?: (pressed: boolean) => void
}

/** One pressed fact for render props, styles, coordination and visual feedback. */
export function usePressable({
  accessibilityRole,
  children,
  disabled = false,
  onPress,
  onPressDebounceWait,
  onPressFeedbackChange,
  style,
  ...props
}: PressableOptions) {
  const isDisabled = disabled === true
  const [active, setActive] = useState(false)
  const feedbackOwner = useContext(SwipeCellPressContext)?.feedback
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hovered, setHovered] = useState(false)
  const notifyClick = useSwipeCellPress()
  const handlePress = usePressHandler({
    disabled: isDisabled,
    onPress: (event) => {
      if (notifyClick()) return
      onPress?.(event)
    },
    onPressDebounceWait,
  })
  const testOnlyPressed = props.testOnly_pressed === true
  const pressed = !isDisabled && (active || testOnlyPressed)
  const state: PressableState =
    Platform.OS === 'web' ? { pressed, hovered: !isDisabled && hovered } : { pressed }
  const lastFeedback = useRef<{ pressed: boolean; callback: typeof onPressFeedbackChange } | null>(
    null,
  )
  const notifyFeedback = useCallback(
    (next: boolean) => {
      const previous = lastFeedback.current
      if (previous?.pressed === next && previous.callback === onPressFeedbackChange) return
      lastFeedback.current = { pressed: next, callback: onPressFeedbackChange }
      onPressFeedbackChange?.(next)
    },
    [onPressFeedbackChange],
  )

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimer.current !== null) {
      clearTimeout(feedbackTimer.current)
      feedbackTimer.current = null
    }
  }, [])
  const cancelFeedback = useCallback(() => {
    clearFeedbackTimer()
    setActive(false)
    notifyFeedback(!isDisabled && testOnlyPressed)
  }, [clearFeedbackTimer, isDisabled, notifyFeedback, testOnlyPressed])

  useEffect(() => {
    const unsubscribe = feedbackOwner?.subscribe(cancelFeedback)
    return () => {
      unsubscribe?.()
      clearFeedbackTimer()
    }
  }, [feedbackOwner, cancelFeedback, clearFeedbackTimer])
  useEffect(() => {
    if (isDisabled) {
      cancelFeedback()
      setHovered(false)
    }
  }, [isDisabled, cancelFeedback])
  useEffect(() => {
    // Configuration and testOnly_pressed changes do not have a native press event.
    const previous = lastFeedback.current
    if (previous?.pressed !== pressed || previous.callback !== onPressFeedbackChange) {
      lastFeedback.current = { pressed, callback: onPressFeedbackChange }
      onPressFeedbackChange?.(pressed)
    }
  }, [onPressFeedbackChange, pressed])

  const handlePressIn: NonNullable<typeof props.onPressIn> = (event) => {
    if (!isDisabled) {
      clearFeedbackTimer()
      if (feedbackOwner) {
        // Native responder grant can dispatch pressIn before touchStart bubbles.
        feedbackOwner.begin()
        const generation = feedbackOwner.generation
        feedbackTimer.current = setTimeout(() => {
          feedbackTimer.current = null
          if (feedbackOwner.cancelled || feedbackOwner.generation !== generation) return
          notifyFeedback(true)
          setActive(true)
        }, feedbackOwner.delay)
      } else {
        notifyFeedback(true)
        setActive(true)
      }
    }
    props.onPressIn?.(event)
  }
  const handleLongPress: NonNullable<typeof props.onLongPress> = (event) => {
    if (isDisabled || notifyClick()) return
    props.onLongPress?.(event)
  }
  const handlePressOut: NonNullable<typeof props.onPressOut> = (event) => {
    if (Platform.OS === 'web') feedbackOwner?.end()
    cancelFeedback()
    props.onPressOut?.(event)
  }
  const handleHoverIn: NonNullable<typeof props.onHoverIn> = (event) => {
    if (!isDisabled) setHovered(true)
    props.onHoverIn?.(event)
  }
  const handleHoverOut: NonNullable<typeof props.onHoverOut> = (event) => {
    setHovered(false)
    props.onHoverOut?.(event)
  }

  return {
    state,
    children: typeof children === 'function' ? children(state) : children,
    style: typeof style === 'function' ? style(state) : style,
    hostProps: {
      ...props,
      accessibilityRole: accessibilityRole ?? (onPress ? 'button' : undefined),
      disabled: isDisabled,
      onPress: handlePress,
      onLongPress: feedbackOwner || props.onLongPress ? handleLongPress : undefined,
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onHoverIn: handleHoverIn,
      onHoverOut: handleHoverOut,
    },
  }
}
