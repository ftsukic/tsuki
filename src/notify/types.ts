import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

export type NotifyType = 'primary' | 'success' | 'error' | 'warning'

export interface NotifyProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  message?: ReactNode
  type?: NotifyType
  color?: ColorValue
  backgroundColor?: ColorValue
  visible?: boolean
  duration?: number
  safeAreaInsetTop?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  onClosed?: () => void
}

export interface NotifyMethods {
  close: () => void
  setMessage: (message: ReactNode) => void
}
