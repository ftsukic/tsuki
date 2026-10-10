import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { useInteraction, useInteractionPress } from './hooks'
import type { InteractionPressableProps, InteractionPressableState } from './types'

interface InteractionPressableOptions extends InteractionPressableProps {
  /** Legacy post-commit notification. */
  onPressedChange?: (pressed: boolean) => void
  /** Private synchronous visual bridge; never forwarded to the native host. */
  onPressFeedbackChange?: (pressed: boolean) => void
}

/** One pressed fact for render props, styles, coordination and visual feedback. */
export function useInteractionPressable({
  accessibilityRole,
  children,
  disabled = false,
  interactionId,
  onPress,
  onPressDebounceWait,
  onPressedChange,
  onPressFeedbackChange,
  style,
  ...props
}: InteractionPressableOptions) {
  const isDisabled = disabled === true
  const [active, setActive] = useState(false)
  const [hovered, setHovered] = useState(false)
  const interaction = useInteraction()
  const handlePress = useInteractionPress({ disabled: isDisabled, onPress, onPressDebounceWait })
  const testOnlyPressed = props.testOnly_pressed === true
  const pressed = !isDisabled && (active || testOnlyPressed)
  const state: InteractionPressableState =
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
    onPressedChange?.(pressed)
  }, [onPressedChange, pressed])
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
      interaction.notifyPress(interactionId)
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
