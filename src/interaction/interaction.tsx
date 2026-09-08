import { forwardRef, useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import { useInteraction, useInteractionPress } from './hooks'
import type { InteractionPressableProps } from './interface'

export const InteractionPressable = forwardRef<
  React.ElementRef<typeof Pressable>,
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
  const interaction = useInteraction()
  const handlePress = useInteractionPress({
    disabled: isDisabled,
    onPress,
    onPressDebounceWait,
  })

  useEffect(() => {
    if (isDisabled) setActive(false)
  }, [isDisabled])

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

  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      accessibilityRole={accessibilityRole ?? (onPress ? 'button' : undefined)}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={({ pressed }) => {
        const effectivePressed = !isDisabled && (pressed || active)
        return typeof style === 'function' ? style({ pressed: effectivePressed }) : style
      }}
    >
      {({ pressed }) => {
        const effectivePressed = !isDisabled && (pressed || active)
        return typeof children === 'function' ? children({ pressed: effectivePressed }) : children
      }}
    </Pressable>
  )
})

InteractionPressable.displayName = 'InteractionPressable'
