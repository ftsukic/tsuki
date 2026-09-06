import type { DescriptionToken } from '../theme'
import type { ReactElement, ReactNode } from 'react'
import type {
  ColorValue,
  FlexStyle,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'

export interface DescriptionContextState {
  colon?: boolean
  contentStyle?: StyleProp<ViewStyle>
  contentTextStyle?: StyleProp<TextStyle>
  labelStyle?: StyleProp<ViewStyle>
  labelTextStyle?: StyleProp<TextStyle>
  labelWidth?: number
  layout?: 'horizontal' | 'vertical'
  size?: 's' | 'm' | 'l'
  numberOfLines?: number
  justify?: FlexStyle['justifyContent']
  align?: FlexStyle['alignItems']
  empty?: ReactNode
  showEmpty?: boolean
}
export interface DescriptionGroupProps extends DescriptionContextState, ViewProps {}
export interface DescriptionProps extends DescriptionContextState, ViewProps {
  theme?: Partial<DescriptionToken>
  label?: string
  text?: string
  hidden?: boolean
  bold?: boolean
  color?: ColorValue
  addonBefore?: ReactElement
  addonAfter?: ReactElement
  renderLabel?: (colon: string) => ReactNode
  render?: (content: ReactNode, addonBefore: ReactNode, addonAfter: ReactNode) => ReactNode
}
export interface DescriptionThousandProps extends Omit<DescriptionProps, 'text'> {
  text?: number
}
export interface DescriptionDateProps extends Omit<DescriptionProps, 'text'> {
  text?: Date
  mode?: string
}
export interface DescriptionDateRangeProps extends Omit<DescriptionDateProps, 'text'> {
  text?: [Date, Date]
  split?: string
}
