import type { PopoverToken } from '../theme'
import type { ReactNode, Ref } from 'react'
import type { ColorValue, StyleProp, TextProps, View, ViewStyle } from 'react-native'
import type { PopoverPlacement } from 'react-native-popover-view'

export interface PopoverItemProps<T> {
  theme?: Partial<PopoverToken>
  value: T
  disabled?: boolean
  dark?: boolean
  style?: StyleProp<ViewStyle>
  divider?: boolean
  onSelect?: (value: T) => void
}
export interface PopoverProps<T> {
  theme?: Partial<PopoverToken>
  content: ReactNode
  children?: ReactNode
  trigger?: 'onLongPress' | 'onPress' | 'onPressIn'
  dark?: boolean
  showBackground?: boolean
  direction?: 'vertical' | 'horizontal'
  shadow?: boolean
  arrow?: boolean
  triggerStyle?: StyleProp<ViewStyle>
  popoverStyle?: StyleProp<ViewStyle>
  backgroundStyle?: StyleProp<ViewStyle>
  placement?: PopoverPlacement | PopoverPlacement[]
  onSelect?: (value: T, index?: number) => void
  disabled?: boolean
  renderContentComponent?: (nodes: ReactNode, closePopover: () => void) => ReactNode
  renderTrigger?: (sourceRef: Ref<View>, openPopover: () => void) => ReactNode
  duration?: number
  onRequestClose?: () => void
}
export interface PopoverTextProps extends TextProps {
  theme?: Partial<PopoverToken>
  text: string
  dark?: boolean
  divider?: boolean
  disabled?: boolean
  color?: ColorValue
}
