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
  name?: ReactNode
  subname?: ReactNode
  color?: string
  loading?: boolean
  disabled?: boolean
  callback?: (action: ActionSheetAction) => void
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
  subname?: StyleProp<TextStyle>
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
  onSelect?: (action: ActionSheetAction, index: number) => void
  onPressOverlay?: (event: GestureResponderEvent) => void
  onOpened?: () => void
  onClosed?: () => void
}

export type ActionSheetOptions<T extends ActionSheetAction = ActionSheetAction> = Omit<
  ActionSheetProps,
  'visible' | 'actions' | 'onClose' | 'onOpened' | 'onClosed'
> & {
  actions?: readonly T[]
}

export type ActionSheetResult<T extends ActionSheetAction = ActionSheetAction> = T | undefined

export type ActionSheetStyleInfo = StyleInfo<ActionSheetProps, ActionSheetStyleState>
