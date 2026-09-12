import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type PickerValue = string | number

export interface PickerOption {
  text: string
  value: PickerValue
  disabled?: boolean
  children?: readonly PickerOption[]
}

export type PickerColumnData = readonly PickerOption[]

export interface PickerColumnContext {
  selectedValues: readonly PickerValue[]
  selectedIndexes: readonly number[]
  selectedOptions: readonly PickerOption[]
  values: readonly PickerValue[]
  indexes: readonly number[]
}

export type PickerColumnSource =
  PickerColumnData | ((context: PickerColumnContext) => PickerColumnData | undefined)

export type PickerColumns = PickerColumnData | readonly PickerColumnSource[]

export interface PickerChangeInfo {
  columnIndex: number
  index: number
  option: PickerOption
}

export interface PickerViewStyleState {
  values: readonly PickerValue[]
  options: readonly PickerOption[]
  indexes: readonly number[]
}

export interface PickerViewSemanticStyles {
  root?: StyleProp<ViewStyle>
  columns?: StyleProp<ViewStyle>
  column?: StyleProp<ViewStyle>
  item?: StyleProp<ViewStyle>
  itemLabel?: StyleProp<TextStyle>
  mask?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
}

export type PickerViewStyles = StyleResolver<
  PickerViewProps,
  PickerViewStyleState,
  PickerViewSemanticStyles
>

export interface PickerViewProps extends Omit<ViewProps, 'children' | 'style'> {
  columns: PickerColumns
  value?: readonly PickerValue[]
  defaultValue?: readonly PickerValue[]
  onChange?: (values: readonly PickerValue[], options: readonly PickerOption[]) => void
  itemHeight?: number
  visibleItemCount?: number
  style?: StyleProp<ViewStyle>
  styles?: PickerViewStyles
}

export interface PickerStyleState extends PickerViewStyleState {
  visible: boolean
}

export interface PickerSemanticStyles extends PickerViewSemanticStyles {
  container?: StyleProp<ViewStyle>
  toolbar?: StyleProp<ViewStyle>
  toolbarButton?: StyleProp<ViewStyle>
  toolbarButtonLabel?: StyleProp<TextStyle>
  toolbarTitle?: StyleProp<TextStyle>
}

export type PickerStyles = StyleResolver<PickerProps, PickerStyleState, PickerSemanticStyles>

export interface PickerProps extends Omit<PickerViewProps, 'style' | 'styles' | 'onChange'> {
  title?: ReactNode
  showToolbar?: boolean
  showToolbarDivider?: boolean
  confirmButtonText?: ReactNode
  cancelButtonText?: ReactNode
  visible?: boolean
  overlay?: boolean
  closeOnPressOverlay?: boolean
  safeAreaInsetBottom?: boolean
  duration?: number
  onChange?: (values: readonly PickerValue[], options: readonly PickerOption[]) => void
  onConfirm?: (values: readonly PickerValue[], options: readonly PickerOption[]) => void
  onCancel?: () => void
  style?: StyleProp<ViewStyle>
  styles?: PickerStyles
}

export type PickerAction = 'confirm' | 'cancel'

export interface PickerResult {
  action: PickerAction
  values: readonly PickerValue[]
  options: readonly PickerOption[]
}

export type PickerOptions = Omit<PickerProps, 'visible'>

export type PickerStyleInfo = StyleInfo<PickerProps, PickerStyleState>
