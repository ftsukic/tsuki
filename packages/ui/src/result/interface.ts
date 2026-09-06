import type { ResultToken } from '../theme'
import type { ColorValue, StyleProp, TextStyle, ViewProps } from 'react-native'

export type ResultStatus = 'success' | 'error' | 'info' | 'warning'
export interface ResultProps extends ViewProps {
  theme?: Partial<ResultToken>
  subtitleTextStyle?: StyleProp<TextStyle>
  titleTextStyle?: StyleProp<TextStyle>
  extra?: React.ReactNode
  renderIcon?: (color: ColorValue, size: number) => React.ReactNode
  status: ResultStatus
  subtitle?: React.ReactNode
  title?: React.ReactNode
}
