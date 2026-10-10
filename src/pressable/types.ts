import type { ColorValue, StyleProp, ViewStyle } from 'react-native'
import type { InteractionPressableProps } from '../interaction/types'

export type PressStyle = 'opacity' | 'scale' | 'background' | 'overlay' | 'none'

export interface UsePressAnimationOptions {
  pressed: boolean
  disabled?: boolean
  motion?: boolean
  pressStyle?: PressStyle
  duration?: number
  pressedOpacity?: number
  pressedScale?: number
}

export interface PressableProps extends InteractionPressableProps {
  /** Disable motion while retaining immediate visual press feedback. */
  motion?: boolean
  /** Visual feedback applied while the press is active. */
  pressStyle?: PressStyle
  /** Opacity used by the `opacity` press style. Defaults to the theme alias token. */
  pressedOpacity?: number
  /** Scale used by the `scale` press style. */
  pressedScale?: number
  /** Background color used by the `background` press style. */
  pressedBackgroundColor?: ColorValue
  /** Overlay color used by the `overlay` press style. */
  pressedOverlayColor?: ColorValue
  /** Final override for background root or overlay layer; unused by opacity/scale/none. */
  pressedStyle?: StyleProp<ViewStyle>
}
