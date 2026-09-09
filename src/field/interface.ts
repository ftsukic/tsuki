import type { ReactNode } from 'react'
import type { DimensionValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type FieldStatus = 'default' | 'error' | 'warning'
export type FieldLabelAlign = 'left' | 'center' | 'right'

export interface FieldStyleState {
  status: FieldStatus
}

export interface FieldSemanticStyles {
  root?: StyleProp<ViewStyle>
  row?: StyleProp<ViewStyle>
  labelContainer?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  required?: StyleProp<TextStyle>
  content?: StyleProp<ViewStyle>
  description?: StyleProp<TextStyle>
  error?: StyleProp<TextStyle>
}

export type FieldStyles = StyleResolver<FieldProps, FieldStyleState, FieldSemanticStyles>

export interface FieldProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  label?: ReactNode
  required?: boolean
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  colon?: boolean
  style?: StyleProp<ViewStyle>
  styles?: FieldStyles
}

export type FieldStyleInfo = StyleInfo<FieldProps, FieldStyleState>
