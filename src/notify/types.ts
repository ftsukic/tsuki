import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

import type { StyleInfo, StyleResolver } from '../style'

export interface NotifyStyleState {
  visible: boolean
}

export interface NotifySemanticStyles {
  root?: StyleProp<ViewStyle>
  container?: StyleProp<ViewStyle>
  content?: StyleProp<TextStyle>
}

export type NotifyStyles = StyleResolver<NotifyProps, NotifyStyleState, NotifySemanticStyles>
export type NotifyStyleInfo = StyleInfo<NotifyProps, NotifyStyleState>

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
  styles?: NotifyStyles
  onClosed?: () => void
}

export interface NotifyMethods {
  close: () => void
  setMessage: (message: ReactNode) => void
}
