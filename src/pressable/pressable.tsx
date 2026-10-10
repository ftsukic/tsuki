import { forwardRef, useCallback, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { AnimatedPressableHost } from './pressable-host'
import { usePressable } from './usePressable'
import { useToken } from '../theme'
import { usePressAnimationController } from './usePressAnimationController'
import type { PressableProps } from './types'

export type { PressableProps } from './types'

export const Pressable = forwardRef<
  React.ComponentRef<typeof AnimatedPressableHost>,
  PressableProps
>(function Pressable(
  {
    motion,
    pressStyle = 'opacity',
    pressedBackgroundColor,
    pressedOpacity,
    pressedOverlayColor,
    pressedScale,
    pressedStyle,
    ...props
  },
  ref,
) {
  const { token } = useToken()
  const feedback = useRef<((pressed: boolean) => void) | null>(null)
  const handleFeedbackChange = useCallback((pressed: boolean) => feedback.current?.(pressed), [])
  const interaction = usePressable({
    ...props,
    onPressFeedbackChange: handleFeedbackChange,
  })
  const rootStyle = StyleSheet.flatten(interaction.style)
  const { animatedStyle, setPressed } = usePressAnimationController({
    disabled: props.disabled,
    initialPressed: interaction.state.pressed,
    motion,
    pressStyle,
    pressedOpacity: pressedOpacity ?? token.pressedOpacity,
    pressedScale,
    // Animated styles override static styles on native. Resolve user overrides
    // inside the animated style rather than relying on array order.
    rootOpacity: rootStyle?.opacity,
    rootTransform: rootStyle?.transform,
  })
  feedback.current = setPressed
  const pressed = interaction.state.pressed
  const background =
    pressStyle === 'background' && pressed
      ? [{ backgroundColor: pressedBackgroundColor ?? token.pressedBackgroundColor }, pressedStyle]
      : undefined
  const overlay =
    pressStyle === 'overlay' && pressed ? (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: pressedOverlayColor ?? token.pressedOverlayColor },
          pressedStyle,
        ]}
      />
    ) : null

  return (
    <AnimatedPressableHost
      {...interaction.hostProps}
      ref={ref}
      style={[
        pressStyle === 'overlay' && { overflow: 'hidden' },
        interaction.style,
        animatedStyle,
        background,
      ]}
    >
      {interaction.children}
      {overlay}
    </AnimatedPressableHost>
  )
})
Pressable.displayName = 'Pressable'
