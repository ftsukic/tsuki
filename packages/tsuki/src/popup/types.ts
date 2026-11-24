import type { ReactNode, RefObject } from 'react'
import type { StyleProp, View, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'

export type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export type PopupClassNames = ClassNames<'root' | 'mask' | 'wrapper' | 'container'>

export interface PopupStyles {
  root?: StyleProp<ViewStyle>
  mask?: StyleProp<ViewStyle>
  wrapper?: StyleProp<ViewStyle>
  container?: StyleProp<ViewStyle>
}

export interface PopupProps {
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  afterOpen?: () => void
  afterClose?: () => void
  closeOnBack?: boolean
  initialFocusRef?: RefObject<View | null>
  returnFocusRef?: RefObject<View | null>
  position?: PopupPosition
  round?: boolean
  overlay?: boolean
  closeOnPressOverlay?: boolean
  onPressOverlay?: () => void
  modal?: boolean
  /** Wraps content in an internal ScrollView when true. Defaults to false for FlatList / full-height drawer compatibility. */
  scrollable?: boolean
  closeable?: boolean
  closeIcon?: ReactNode
  keyboardAvoiding?: boolean
  safeAreaInsetTop?: boolean
  safeAreaInsetBottom?: boolean
  className?: string
  classNames?: PopupClassNames
  style?: StyleProp<ViewStyle>
  styles?: PopupStyles
  testID?: string
  children?: ReactNode
}
