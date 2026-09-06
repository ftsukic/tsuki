import type { CollapseToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

export interface CollapseProps extends Pick<ViewProps, 'testID'> {
  children?: ReactNode
  theme?: Partial<CollapseToken>
  title?: ReactNode
  titleStyle?: StyleProp<ViewStyle>
  titleTextStyle?: StyleProp<TextStyle>
  iconStyle?: StyleProp<ViewStyle>
  iconColor?: ColorValue
  iconSize?: number
  bodyStyle?: StyleProp<ViewStyle>
  renderTitle?: (collapse: boolean) => ReactNode
  renderTitleExtra?: (collapse: boolean, arrow: ReactNode) => ReactNode
  renderBody?: () => ReactNode
  collapse?: boolean
  defaultCollapse?: boolean
  onCollapse?: (collapse: boolean) => void
  type?: 'cell' | 'card'
  onAnimationEnd?: (collapse: boolean) => void
  bodyPadding?: boolean
  headerDivider?: boolean
  bodyDivider?: boolean
  lazyRender?: boolean
  square?: boolean
}
