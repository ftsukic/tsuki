import type { CardToken } from '../theme'
import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

export interface CardProps extends ViewProps {
  children?: ReactNode
  theme?: Partial<CardToken>
  title?: ReactNode
  titleLeftExtra?: ReactNode
  extra?: ReactNode
  footer?: ReactNode
  headerStyle?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<ViewStyle>
  titleTextStyle?: StyleProp<TextStyle>
  bodyStyle?: StyleProp<ViewStyle>
  footerStyle?: StyleProp<ViewStyle>
  footerTextStyle?: StyleProp<TextStyle>
  size?: 'm' | 's'
  square?: boolean
  headerDivider?: boolean
  footerDivider?: boolean
  bodyPadding?:
    | boolean
    | number
    | {
        left?: boolean | number
        right?: boolean | number
        top?: boolean | number
        bottom?: boolean | number
      }
  onPressHeader?: () => void
  onLayoutHeader?: ViewProps['onLayout']
  onLayoutBody?: ViewProps['onLayout']
}
