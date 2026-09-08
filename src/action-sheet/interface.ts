import type { ReactNode } from 'react'
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface ActionSheetAction {
  name: ReactNode
  description?: ReactNode
  disabled?: boolean
  danger?: boolean
  loading?: boolean
  onPress?: () => void
}

export interface ActionSheetStyleState {
  visible: boolean
}

export interface ActionSheetSemanticStyles {
  host?: StyleProp<ViewStyle>
  overlay?: StyleProp<ViewStyle>
  root?: StyleProp<ViewStyle>
  actions?: StyleProp<ViewStyle>
  header?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  action?: StyleProp<ViewStyle>
  name?: StyleProp<TextStyle>
  description?: StyleProp<TextStyle>
  cancelGap?: StyleProp<ViewStyle>
  cancelPanel?: StyleProp<ViewStyle>
  cancel?: StyleProp<ViewStyle>
  cancelLabel?: StyleProp<TextStyle>
}

export type ActionSheetStyles = StyleResolver<
  ActionSheetProps,
  ActionSheetStyleState,
  ActionSheetSemanticStyles
>

export interface ActionSheetProps extends Omit<ViewProps, 'children' | 'style'> {
  visible?: boolean
  title?: ReactNode
  actions?: readonly ActionSheetAction[]
  cancelText?: ReactNode
  closeOnAction?: boolean
  closeOnPressOverlay?: boolean
  overlay?: boolean
  safeAreaInsetBottom?: boolean
  overlayStyle?: StyleProp<ViewStyle>
  zIndex?: number
  style?: StyleProp<ViewStyle>
  styles?: ActionSheetStyles
  onClose?: () => void
  onPressOverlay?: (event: GestureResponderEvent) => void
  onOpened?: () => void
  onClosed?: () => void
}

export type ActionSheetOptions = Omit<
  ActionSheetProps,
  'visible' | 'onClose' | 'onOpened' | 'onClosed'
>

export type ActionSheetResult = ActionSheetAction | 'cancel'

export type ActionSheetStyleInfo = StyleInfo<ActionSheetProps, ActionSheetStyleState>
