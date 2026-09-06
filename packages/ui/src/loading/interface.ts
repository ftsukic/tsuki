import type { LoadingToken } from '../theme'
import type { ColorValue, StyleProp, TextStyle, ViewProps } from 'react-native'

export interface LoadingProps extends ViewProps {
  theme?: Partial<LoadingToken>
  textStyle?: StyleProp<TextStyle>
  color?: ColorValue
  type?: 'spinner' | 'circular'
  size?: number
  textSize?: number
  vertical?: boolean
  loadingIcon?: React.ReactNode | ((size: number, color: ColorValue) => React.ReactNode)
}
