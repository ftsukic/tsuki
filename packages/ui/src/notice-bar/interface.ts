import type { NoticeBarToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, TouchableWithoutFeedbackProps } from 'react-native'

export type NoticeBarStatus = 'info' | 'success' | 'warning' | 'error'
export type NoticeBarMode = 'closeable' | 'link'

export interface NoticeBarProps extends Omit<TouchableWithoutFeedbackProps, 'hitSlop'> {
  theme?: Partial<NoticeBarToken>
  messageTextStyle?: StyleProp<TextStyle>
  message?: ReactNode
  status?: NoticeBarStatus
  mode?: NoticeBarMode
  bordered?: boolean
  color?: ColorValue
  backgroundColor?: ColorValue
  iconColor?: ColorValue
  wrapable?: boolean
  square?: boolean
  size?: 'm' | 's'
  renderLeftIcon?: (color: ColorValue, size: number) => ReactNode
  renderRightIcon?: (color: ColorValue, size: number) => ReactNode
  onPressClose?: () => void
}
