import type { ColorValue, PressableProps, StyleProp, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type SwitchSize = 'small' | 'medium' | 'large'

export interface SwitchStyleState {
  active: boolean
  disabled: boolean
  loading: boolean
  pressed: boolean
  hovered: boolean
  size: SwitchSize | number
}

export interface SwitchSemanticStyles {
  root?: StyleProp<ViewStyle>
  track?: StyleProp<ViewStyle>
  thumb?: StyleProp<ViewStyle>
  loading?: StyleProp<ViewStyle>
}

export type SwitchStyles<ActiveValueT = boolean, InactiveValueT = boolean> = StyleResolver<
  SwitchProps<ActiveValueT, InactiveValueT>,
  SwitchStyleState,
  SwitchSemanticStyles
>

export interface SwitchProps<ActiveValueT = boolean, InactiveValueT = boolean> extends Omit<
  PressableProps,
  'children' | 'style' | 'disabled' | 'onPress'
> {
  value?: ActiveValueT | InactiveValueT
  defaultValue?: ActiveValueT | InactiveValueT
  loading?: boolean
  disabled?: boolean
  size?: SwitchSize | number
  activeColor?: ColorValue
  inactiveColor?: ColorValue
  activeValue?: ActiveValueT
  inactiveValue?: InactiveValueT
  onPress?: () => void
  onChange?: (value: ActiveValueT | InactiveValueT) => void
  beforeChange?: (value: ActiveValueT | InactiveValueT) => boolean | Promise<boolean>
  style?: StyleProp<ViewStyle>
  styles?: SwitchStyles<ActiveValueT, InactiveValueT>
}

export type SwitchStyleInfo<ActiveValueT = boolean, InactiveValueT = boolean> = StyleInfo<
  SwitchProps<ActiveValueT, InactiveValueT>,
  SwitchStyleState
>
