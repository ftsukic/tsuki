import type { ColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native'

export interface DividerProps extends ViewProps {
  color?: ColorValue
  inset?: number
  style?: StyleProp<ViewStyle>
  thickness?: number
}
