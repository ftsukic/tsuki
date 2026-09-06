import type { BadgeToken } from '../theme'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

export interface BadgeProps extends ViewProps {
  theme?: Partial<BadgeToken>
  countStyle?: StyleProp<ViewStyle>
  countTextStyle?: StyleProp<TextStyle>
  count?: number | string
  color?: ColorValue
  dot?: boolean
  max?: number
  loading?: boolean
  showZero?: boolean
  offset?: [number, number]
  status?: 'primary' | 'success' | 'warning' | 'error'
}
