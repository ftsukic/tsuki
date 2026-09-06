import type { CellToken } from '../theme'
import type { ReactNode } from 'react'
import type {
  ColorValue,
  PressableProps,
  StyleProp,
  TextProps,
  TextStyle,
  ViewStyle,
} from 'react-native'
import type { SwipeableProps } from 'react-native-gesture-handler/ReanimatedSwipeable'

export interface SwipeCellRef {
  close: () => void
  openLeft: () => void
  openRight: () => void
  reset: () => void
}

export interface SwipeCellAction {
  actionButtonProps?: PressableProps
  backgroundColor?: string
  color?: string
  disabled?: boolean
  maxWidth?: number
  minWidth?: number
  onPress?: () => void | Promise<void>
  style?: StyleProp<TextStyle>
  text?: ReactNode
  textNumberOfLines?: number
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip'
}

export interface SwipeCellProps extends CellProps {
  left?: SwipeCellAction[]
  right?: SwipeCellAction[]
  actionLayoutKey?: string | number
  closeOnAction?: boolean
  closeOnTouchOutside?: boolean
  swipeableProps?: Omit<SwipeableProps, 'children' | 'renderLeftActions' | 'renderRightActions'>
}

export interface CellGroupProps {
  children?: ReactNode
  title?: ReactNode
  extra?: ReactNode
  style?: StyleProp<ViewStyle>
  titleTextStyle?: StyleProp<TextStyle>
  bodyStyle?: StyleProp<ViewStyle>
  bodyTopDivider?: boolean
  bodyBottomDivider?: boolean
  onPressTitle?: PressableProps['onPress']
  onPressTitleText?: TextProps['onPress']
  theme?: Partial<CellToken>
}

export interface CellProps extends Omit<PressableProps, 'style' | 'children'> {
  title?: ReactNode
  value?: ReactNode
  titleExtra?: ReactNode
  valueExtra?: ReactNode
  extra?: ReactNode
  innerStyle?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<ViewStyle>
  titleTextStyle?: StyleProp<TextStyle>
  valueStyle?: StyleProp<ViewStyle>
  valueTextStyle?: StyleProp<TextStyle>
  extraTextStyle?: StyleProp<TextStyle>
  contentStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  divider?: boolean
  dividerLeftGap?: number
  dividerRightGap?: number
  isLink?: boolean
  onPressLink?: PressableProps['onPress']
  underlayColor?: ColorValue
  center?: boolean
  arrowDirection?: 'left' | 'up' | 'right' | 'down'
  required?: boolean
  vertical?: boolean
  valueTextNumberOfLines?: number
  titleTextNumberOfLines?: number
  textAlign?: 'left' | 'center' | 'right'
  onPressDebounceWait?: number
  theme?: Partial<CellToken>
}
