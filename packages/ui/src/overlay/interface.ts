import type { OverlayToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native'

export interface OverlayProps {
  children?: ReactNode
  theme?: Partial<OverlayToken>
  style?: StyleProp<ViewStyle>
  overlayStyle?: StyleProp<ViewStyle>
  visible: boolean
  zIndex?: number
  duration?: number
  onPress?: () => void
  onClosed?: () => void
  onRequestClose?: () => boolean
  backgroundColor?: ColorValue
  testID?: ViewProps['testID']
}
