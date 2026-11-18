import type { ColorValue, ViewProps } from 'react-native'

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical'
  color?: ColorValue
  thickness?: number
  inset?: number
  className?: string
}
