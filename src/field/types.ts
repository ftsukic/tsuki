import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { CellProps } from '../cell'
import type { StyleInfo, StyleResolver } from '../style'

export type FieldStatus = 'default' | 'error' | 'warning'
export type FieldTitleAlign = 'left' | 'center' | 'right'

export type FieldCellProps = Pick<
  CellProps,
  | 'leading'
  | 'title'
  | 'titleExtra'
  | 'description'
  | 'valueExtra'
  | 'trailing'
  | 'vertical'
  | 'center'
  | 'valueAlign'
  | 'required'
  | 'border'
  | 'divider'
  | 'showArrow'
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
  title?: StyleProp<TextStyle>
  control?: StyleProp<ViewStyle>
  feedback?: StyleProp<ViewStyle>
  error?: StyleProp<TextStyle>
  help?: StyleProp<TextStyle>
}

export type FieldStyles<Props = unknown> = StyleResolver<
  Props,
  FieldStyleState,
  FieldSemanticStyles
>

export type FieldStyleInfo<Props = unknown> = StyleInfo<Props, FieldStyleState>
