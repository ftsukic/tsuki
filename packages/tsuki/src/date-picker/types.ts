import type { ReactNode } from 'react'
import type { PickerOption, PickerProps } from '../picker/types'

export type DatePickerColumnType = 'year' | 'month' | 'day'
export type DatePickerValue = readonly string[]
export type DatePickerOption = PickerOption
export type DatePickerFormatter = (
  type: DatePickerColumnType,
  option: DatePickerOption,
) => DatePickerOption | string
export type DatePickerFilter = (
  type: DatePickerColumnType,
  options: readonly DatePickerOption[],
  values: DatePickerValue,
) => readonly DatePickerOption[]

export interface DatePickerSelection {
  values: DatePickerValue
  options: readonly DatePickerOption[]
  indexes: readonly number[]
}

export interface DatePickerRef {
  confirm(): DatePickerSelection
  cancel(): void
  getSelectedValues(): DatePickerValue
  getSelectedOptions(): readonly DatePickerOption[]
}
export interface DatePickerProps extends Omit<
  PickerProps,
  | 'columns'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onConfirm'
  | 'onCancel'
  | 'title'
  | 'confirmButtonText'
  | 'cancelButtonText'
> {
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  columnsType?: readonly DatePickerColumnType[]
  minDate?: Date
  maxDate?: Date
  title?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonText?: ReactNode
  formatter?: DatePickerFormatter
  filter?: DatePickerFilter
  onChange?(value: DatePickerValue, options: readonly DatePickerOption[]): void
  onConfirm?(value: DatePickerValue, options: readonly DatePickerOption[]): void
  onCancel?(): void
}
