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
  requestedValues?: readonly PickerValue[]
}

export type PickerColumnSource =
  PickerColumnData | ((context: PickerColumnContext) => PickerColumnData | undefined)

export type PickerColumns = PickerColumnData | readonly PickerColumnSource[]

export interface PickerChangeInfo {
  columnIndex: number
  index: number
  option: PickerOption
}

export interface PickerStyleStateData {
  values: readonly PickerValue[]
  options: readonly PickerOption[]
  indexes: readonly number[]
}

export interface PickerSemanticStyles {
  root?: StyleProp<ViewStyle>
  container?: StyleProp<ViewStyle>
  toolbar?: StyleProp<ViewStyle>
  toolbarButton?: StyleProp<ViewStyle>
  toolbarButtonLabel?: StyleProp<TextStyle>
  toolbarTitle?: StyleProp<TextStyle>
  columns?: StyleProp<ViewStyle>
  column?: StyleProp<ViewStyle>
  item?: StyleProp<ViewStyle>
  itemLabel?: StyleProp<TextStyle>
  mask?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
  loading?: StyleProp<ViewStyle>
}

export type PickerStyleState = PickerStyleStateData

export type PickerStyles = StyleResolver<PickerProps, PickerStyleState, PickerSemanticStyles>

export interface PickerProps extends Omit<ViewProps, 'children' | 'style'> {
  columns: PickerColumns
  value?: readonly PickerValue[]
  defaultValue?: readonly PickerValue[]
  itemHeight?: number
  visibleItemCount?: number
  loading?: boolean
  title?: ReactNode
  showToolbar?: boolean
  showToolbarDivider?: boolean
  confirmButtonText?: ReactNode
  cancelButtonText?: ReactNode
  swipeDuration?: number
  onChange?: (values: readonly PickerValue[], options: readonly PickerOption[]) => void
  onConfirm?: (values: readonly PickerValue[], options: readonly PickerOption[]) => void
  onCancel?: () => void
  style?: StyleProp<ViewStyle>
  styles?: PickerStyles
}

export interface PickerSelection {
  values: readonly PickerValue[]
  options: readonly PickerOption[]
  indexes: readonly number[]
}

export interface PickerRef {
  confirm(): PickerSelection
  cancel(): void
  getSelectedValues(): readonly PickerValue[]
  getSelectedOptions(): readonly PickerOption[]
}

export type PickerAction = 'confirm' | 'cancel'

export interface PickerResult {
  action: PickerAction
  values: readonly PickerValue[]
  options: readonly PickerOption[]
}

export interface PickerOptions extends PickerProps {
  overlay?: boolean
  closeOnPressOverlay?: boolean
  safeAreaInsetBottom?: boolean
  duration?: number
}

export type PickerStyleInfo = StyleInfo<PickerProps, PickerStyleState>
