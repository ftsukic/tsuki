import { forwardRef, useCallback } from 'react'
import { InteractionPressable } from '../interaction'
import type { InteractionPressableProps, InteractionPressableState } from '../interaction'
import { useToken } from '../theme'
import { usePressAnimationController } from './use-press-animation'
import type { PressStyle } from './use-press-animation'

export interface PressableProps extends InteractionPressableProps {
  /** Visual feedback applied while the press is active. */
  pressStyle?: PressStyle
  /** Opacity used by the `opacity` press style. Defaults to the theme alias token. */
  pressedOpacity?: number
  /** Scale used by the `scale` press style. */
  pressedScale?: number
}

export const Pressable = forwardRef<
  React.ComponentRef<typeof InteractionPressable>,
  PressableProps
>(function Pressable(
  {
    children,
    disabled = false,
    pressStyle = 'opacity',
    pressedOpacity,
    pressedScale,
    style,
    testOnly_pressed,
    ...props
  },
  ref,
) {
  const { token } = useToken()
  const { animatedStyle, setPressed } = usePressAnimationController({
    disabled,
    initialPressed: testOnly_pressed === true,
    pressStyle,
    pressedOpacity: pressedOpacity ?? token.pressedOpacity,
    pressedScale,
  })
  const handlePressedChange = useCallback(
    (nextPressed: boolean) => setPressed(nextPressed),
    [setPressed],
  )
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
      onPressedChange={handlePressedChange}
      testOnly_pressed={testOnly_pressed}
      style={interactionStyle}
    >
      {children}
    </InteractionPressable>
  )
})

Pressable.displayName = 'Pressable'
