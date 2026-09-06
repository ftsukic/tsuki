/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ViewProps } from 'react-native'

export type PickerValue = string | number
export interface PickerOption {
  value: PickerValue
  label: PickerValue
  disabled?: boolean
  children?: PickerOption[]
  [key: string]: any
}
export type PickerOptionMultiple =
  PickerOption[] | { options: PickerOption[]; defaultValue?: PickerValue }
export type Column = PickerOption | PickerOptionMultiple

export interface PickerViewProps extends Pick<ViewProps, 'testID'> {
  columns: Column[]
  value?: PickerValue[]
  defaultValue?: PickerValue[]
  onChange?: (values: PickerValue[], options: Column[]) => void
  loading?: boolean
  itemHeight?: number
  visibleItemCount?: number
}
