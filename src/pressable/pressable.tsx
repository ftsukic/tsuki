import { forwardRef, useState } from 'react'
import { InteractionPressable } from '../interaction'
import type { InteractionPressableProps, InteractionPressableState } from '../interaction'
import { usePressAnimation } from './use-press-animation'
import type { PressStyle } from './use-press-animation'

export interface PressableProps extends InteractionPressableProps {
  /** Visual feedback applied while the press is active. */
  pressStyle?: PressStyle
}

export const Pressable = forwardRef<
  React.ComponentRef<typeof InteractionPressable>,
  PressableProps
>(function Pressable(
  { children, disabled = false, onPressIn, onPressOut, pressStyle = 'opacity', style, ...props },
  ref,
) {
  const [pressed, setPressed] = useState(false)
  const animatedStyle = usePressAnimation({
    disabled,
    pressed,
    pressStyle,
  })
  const interactionStyle =
    pressStyle === 'none'
      ? style
      : (state: InteractionPressableState) => [
          animatedStyle,
          typeof style === 'function' ? style(state) : style,
        ]

  return (
    <InteractionPressable
      {...props}
      ref={ref}
      disabled={disabled}
      onPressIn={(event) => {
        setPressed(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setPressed(false)
        onPressOut?.(event)
      }}
      style={interactionStyle}
    >
      {children}
    </InteractionPressable>
  )
})

Pressable.displayName = 'Pressable'
