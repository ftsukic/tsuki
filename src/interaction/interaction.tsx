import { forwardRef, useEffect, useState } from 'react'
import { Platform, Pressable as NativePressable } from 'react-native'
import { createAnimatedComponent } from 'react-native-reanimated'
import { useInteraction, useInteractionPress } from './hooks'
import type { InteractionPressableProps, InteractionPressableState } from './interface'

// Pressable can supply a Reanimated style handle, so the native host must be
// an animated component rather than a plain React Native Pressable.
const AnimatedPressable = createAnimatedComponent(NativePressable)

export const InteractionPressable = forwardRef<
  React.ComponentRef<typeof NativePressable>,
  InteractionPressableProps
>(function InteractionPressable(
  {
    accessibilityRole,
    children,
    disabled = false,
    interactionId,
    onPress,
    onPressDebounceWait,
    style,
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

  const resolvedStyle =
    typeof style === 'function'
      ? style(
          getInteractionState(!isDisabled && (active || pressableProps.testOnly_pressed === true)),
        )
      : style

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

  return (
    <AnimatedPressable
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
        const effectivePressed = !isDisabled && (state.pressed || active)
        const interactionState: InteractionPressableState = {
          ...state,
          pressed: effectivePressed,
        }
        return typeof children === 'function' ? children(interactionState) : children
      }}
    </AnimatedPressable>
  )
})

InteractionPressable.displayName = 'InteractionPressable'
