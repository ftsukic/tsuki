import type { IconName } from '../icon'
import type { NavBarToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

export type NavBarLayout = 'center' | 'flex'

export interface NavBarProps extends Pick<ViewProps, 'testID'> {
  theme?: Partial<NavBarToken>
  layout?: NavBarLayout
  style?: StyleProp<ViewStyle>
  leftStyle?: StyleProp<ViewStyle>
  leftExtra?: ReactNode
  rightStyle?: StyleProp<ViewStyle>
  rightExtra?: ReactNode
  showRightIcon?: boolean
  rightIcon?: IconName
  rightIconSize?: number
  onPressRightIcon?: () => void | Promise<void>
  titleExtra?: ReactNode
  titleTextStyle?: StyleProp<TextStyle>
  title?: ReactNode
  showLeftIcon?: boolean
  leftIcon?: IconName
  leftIconColor?: ColorValue
  leftIconSize?: number
  divider?: boolean
  onPressLeftIcon?: () => void | Promise<void>
}
