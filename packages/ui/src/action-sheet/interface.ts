import type { PopupProps } from '../popup'
import type { ActionSheetToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle } from 'react-native'

export interface Action {
  name: string
  color?: ColorValue
  textStyle?: StyleProp<TextStyle>
  loading?: boolean
  disabled?: boolean
  callback?: () => void
}
export interface ActionSheetProps extends Omit<PopupProps, 'theme'> {
  theme?: Partial<ActionSheetToken>
  actions: Action[]
  title?: ReactNode
  cancelText?: string
  cancelTextStyle?: StyleProp<TextStyle>
  description?: ReactNode
  descriptionStyle?: StyleProp<TextStyle>
  onCancel?: () => void
  onSelect?: (action: Action, index: number) => void
}
