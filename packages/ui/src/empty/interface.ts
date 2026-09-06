import type { ResultToken } from '../theme'
import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

export interface EmptyProps extends Pick<ViewProps, 'testID'> {
  theme?: Partial<ResultToken>
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  iconStyle?: StyleProp<ViewStyle>
  iconSize?: number
  icon?: ReactNode
  text?: ReactNode
  full?: boolean
}
