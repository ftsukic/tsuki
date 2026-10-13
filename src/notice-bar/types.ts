import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface NoticeBarSemanticStyles {
  root?: StyleProp<ViewStyle>
  body?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
  leftIcon?: StyleProp<ViewStyle>
  rightIcon?: StyleProp<ViewStyle>
  closeAction?: StyleProp<ViewStyle>
}

export interface NoticeBarStyleState {
  visible: boolean
  disabled: boolean
  clickable: boolean
  wrapable: boolean
}

export type NoticeBarStyles = StyleResolver<
  NoticeBarProps,
  NoticeBarStyleState,
  NoticeBarSemanticStyles
>
export type NoticeBarStyleInfo = StyleInfo<NoticeBarProps, NoticeBarStyleState>

export interface NoticeBarProps {
  text?: string
  children?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  visible?: boolean
  disabled?: boolean
  scrollable?: boolean
  wrapable?: boolean
  speed?: number
  delay?: number
  accessibilityLabel?: string
  accessibilityHint?: string
  leftIconAccessibilityLabel?: string
  rightIconAccessibilityLabel?: string
  style?: StyleProp<ViewStyle>
  styles?: NoticeBarStyles
  onClick?: () => void
  onClose?: () => void
}
