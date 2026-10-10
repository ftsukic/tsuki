import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
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
  const [hovered, setHovered] = useState(false)
  const notifyPress = useSwipeCellPress()
  const handlePress = usePressHandler({ disabled: isDisabled, onPress, onPressDebounceWait })
  const testOnlyPressed = props.testOnly_pressed === true
  const pressed = !isDisabled && (active || testOnlyPressed)
  const state: PressableState =
    Platform.OS === 'web' ? { pressed, hovered: !isDisabled && hovered } : { pressed }
  const lastFeedback = useRef<{ pressed: boolean; callback: typeof onPressFeedbackChange } | null>(
    null,
  )
  const notifyFeedback = (next: boolean) => {
    const previous = lastFeedback.current
    if (previous?.pressed === next && previous.callback === onPressFeedbackChange) return
    lastFeedback.current = { pressed: next, callback: onPressFeedbackChange }
    onPressFeedbackChange?.(next)
  }

  useEffect(() => {
    if (isDisabled) {
      setActive(false)
      setHovered(false)
    }
  }, [isDisabled])
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
      notifyFeedback(true)
      setActive(true)
      notifyPress()
    }
    props.onPressIn?.(event)
  }
  const handlePressOut: NonNullable<typeof props.onPressOut> = (event) => {
    notifyFeedback(!isDisabled && testOnlyPressed)
    setActive(false)
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
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onHoverIn: handleHoverIn,
      onHoverOut: handleHoverOut,
    },
  }
}
