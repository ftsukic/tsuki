import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type FieldStatus = 'default' | 'error' | 'warning'
export type FieldLabelAlign = 'left' | 'center' | 'right'

export interface FieldStyleState {
  status: FieldStatus
}

export interface FieldSemanticStyles {
  control?: StyleProp<ViewStyle>
  feedback?: StyleProp<ViewStyle>
  description?: StyleProp<TextStyle>
  error?: StyleProp<TextStyle>
}

export type FieldStyles<Props = unknown> = StyleResolver<
  Props,
  FieldStyleState,
  FieldSemanticStyles
>

export type FieldStyleInfo<Props = unknown> = StyleInfo<Props, FieldStyleState>
