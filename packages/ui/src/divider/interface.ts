import type { DividerToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

export type DividerDirection = 'vertical' | 'horizontal'

export interface DividerProps extends ViewProps {
  children?: ReactNode
  theme?: Partial<DividerToken>
  textStyle?: StyleProp<TextStyle>
  direction?: DividerDirection
  dashed?: boolean
  color?: ColorValue
  contentPosition?: 'left' | 'center' | 'right'
  lineStyle?: StyleProp<ViewStyle>
}
