import type { NotifyToken } from '../theme'
import type { ReactNode } from 'react'
import type {
  ColorValue,
  StyleProp,
  TextStyle,
  ViewStyle,
  TouchableWithoutFeedbackProps,
} from 'react-native'

export type NotifyType = 'primary' | 'success' | 'error' | 'warning'
export interface NotifyProps extends Omit<TouchableWithoutFeedbackProps, 'style'> {
  theme?: Partial<NotifyToken>
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  type?: NotifyType
  message?: ReactNode
  color?: ColorValue
  backgroundColor?: ColorValue
  visible?: boolean
  duration?: number
  onClosed?: () => void
}

export interface NotifyMethods {
  close: () => void
  setMessage: (message: ReactNode) => void
}
