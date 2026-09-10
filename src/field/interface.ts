import type { ReactNode } from 'react'
import type { DimensionValue, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { InputProps, InputStyles } from '../input'
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
  control?: StyleProp<ViewStyle>
  description?: StyleProp<TextStyle>
  error?: StyleProp<TextStyle>
}

export type FieldStyles = StyleResolver<FieldProps, FieldStyleState, FieldSemanticStyles>

export interface FieldProps extends Omit<InputProps, 'style' | 'styles'> {
  children?: ReactNode
  label?: ReactNode
  required?: boolean
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  colon?: boolean
  /** Style applied to the internal Input root in the default input mode. */
  inputStyle?: InputProps['style']
  /** Semantic styles forwarded to the internal Input in the default input mode. */
  inputStyles?: InputStyles
  style?: StyleProp<ViewStyle>
  styles?: FieldStyles
}

export type FieldStyleInfo = StyleInfo<FieldProps, FieldStyleState>
