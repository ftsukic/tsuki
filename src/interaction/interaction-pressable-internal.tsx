import { forwardRef, useEffect, useState } from 'react'
import { Platform, Pressable as NativePressable } from 'react-native'
import { createAnimatedComponent } from 'react-native-reanimated'
import { useInteraction, useInteractionPress } from './hooks'
import type { InteractionPressableProps, InteractionPressableState } from './types'

interface InteractionPressableInternalProps extends InteractionPressableProps {
  /** Internal bridge for visual primitives that consume the pressed fact. */
  onPressedChange?: (pressed: boolean) => void
  /** Use an animated native host when the caller supplies a Reanimated style. */
  useAnimatedHost?: boolean
}

// Pressable can supply a Reanimated style handle, so only its animated
// feedback path needs an animated native host.
const AnimatedPressable = createAnimatedComponent(NativePressable)

export const InteractionPressableInternal = forwardRef<
  React.ComponentRef<typeof NativePressable>,
  InteractionPressableInternalProps
>(function InteractionPressableInternal(
  {
    accessibilityRole,
    children,
    disabled = false,
    interactionId,
    onPress,
    onPressDebounceWait,
    onPressedChange,
    style,
    useAnimatedHost = false,
    ...pressableProps
  },
  ref,
) {
  const isDisabled = disabled === true
  const [active, setActive] = useState(false)
  const [hovered, setHovered] = useState(false)
  const interaction = useInteraction()
  const handlePress = useInteractionPress({
    disabled: isDisabled,
    onPress,
    onPressDebounceWait,
  })

  useEffect(() => {
    if (isDisabled) {
      setActive(false)
      setHovered(false)
    }
  }, [isDisabled])

  const getInteractionState = (pressed: boolean): InteractionPressableState =>
    Platform.OS === 'web' ? { pressed, hovered } : { pressed }
  const testOnlyPressed = pressableProps.testOnly_pressed === true
  const effectivePressed = !isDisabled && (active || testOnlyPressed)

  const resolvedStyle =
    typeof style === 'function'
      ? style(getInteractionState(!isDisabled && (active || testOnlyPressed)))
      : style

  useEffect(() => {
    onPressedChange?.(effectivePressed)
  }, [effectivePressed, onPressedChange])

  const handlePressIn = (event: Parameters<NonNullable<typeof pressableProps.onPressIn>>[0]) => {
    if (!isDisabled) {
      setActive(true)
      interaction.notifyPress(interactionId)
    }
    pressableProps.onPressIn?.(event)
  }

  const handlePressOut = (event: Parameters<NonNullable<typeof pressableProps.onPressOut>>[0]) => {
    setActive(false)
    pressableProps.onPressOut?.(event)
  }

  const handleHoverIn = (event: Parameters<NonNullable<typeof pressableProps.onHoverIn>>[0]) => {
    setHovered(true)
    pressableProps.onHoverIn?.(event)
  }

  const handleHoverOut = (event: Parameters<NonNullable<typeof pressableProps.onHoverOut>>[0]) => {
    setHovered(false)
    pressableProps.onHoverOut?.(event)
  }

  const PressableHost = useAnimatedHost ? AnimatedPressable : NativePressable

  return (
    <PressableHost
      ref={ref}
      {...pressableProps}
      accessibilityRole={accessibilityRole ?? (onPress ? 'button' : undefined)}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPress={handlePress}
      style={resolvedStyle}
    >
      {(state) => {
        const interactionState: InteractionPressableState = {
          ...state,
          pressed: !isDisabled && (state.pressed || active || testOnlyPressed),
        }
        return typeof children === 'function' ? children(interactionState) : children
      }}
    </PressableHost>
  )
})

InteractionPressableInternal.displayName = 'InteractionPressableInternal'
