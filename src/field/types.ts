import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { CellProps } from '../cell'
import type { StyleInfo, StyleResolver } from '../style'

export type FieldStatus = 'default' | 'error' | 'warning'
export type FieldTitleAlign = 'left' | 'center' | 'right'

export type FieldCellProps = Pick<
  CellProps,
  | 'icon'
  | 'title'
  | 'titleExtra'
  | 'label'
  | 'valueExtra'
  | 'extra'
  | 'vertical'
  | 'center'
  | 'valueAlign'
  | 'required'
  | 'border'
  | 'divider'
  | 'isLink'
  | 'clickable'
  | 'arrowDirection'
  | 'onPress'
  | 'onPressDebounceWait'
>

export interface FieldStyleState {
  status: FieldStatus
}

export interface FieldSemanticStyles {
  root?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  content?: StyleProp<ViewStyle>
  help?: StyleProp<ViewStyle>
  helpItem?: StyleProp<TextStyle>
  extra?: StyleProp<TextStyle>
}

export type FieldStyles<Props = unknown> = StyleResolver<
  Props,
  FieldStyleState,
  FieldSemanticStyles
>

export type FieldStyleInfo<Props = unknown> = StyleInfo<Props, FieldStyleState>
