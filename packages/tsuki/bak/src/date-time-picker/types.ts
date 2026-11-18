import type { ReactNode } from 'react'
import type { PickerOption, PickerProps } from '../picker/types'
import type { DateTimeColumnType } from '../picker/date-time/types'

export type DateTimePickerColumnType = DateTimeColumnType
export type DateTimePickerValue = readonly string[]
export type DateTimePickerOption = PickerOption
export type DateTimePickerFormatter = (
  type: DateTimePickerColumnType,
  option: DateTimePickerOption,
) => DateTimePickerOption | string
export type DateTimePickerFilter = (
  type: DateTimePickerColumnType,
  options: readonly DateTimePickerOption[],
  values: DateTimePickerValue,
) => readonly DateTimePickerOption[]

export interface DateTimePickerSelection {
  values: DateTimePickerValue
  options: readonly DateTimePickerOption[]
  indexes: readonly number[]
}

export interface DateTimePickerRef {
  confirm(): DateTimePickerSelection
  cancel(): void
  getSelectedValues(): DateTimePickerValue
  getSelectedOptions(): readonly DateTimePickerOption[]
}

export interface DateTimePickerProps extends Omit<
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
  value?: DateTimePickerValue
  defaultValue?: DateTimePickerValue
  columnsType?: readonly DateTimePickerColumnType[]
  minDate?: Date
  maxDate?: Date
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  title?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonText?: ReactNode
  formatter?: DateTimePickerFormatter
  filter?: DateTimePickerFilter
  onChange?(value: DateTimePickerValue, options: readonly DateTimePickerOption[]): void
  onConfirm?(value: DateTimePickerValue, options: readonly DateTimePickerOption[]): void
  onCancel?(): void
}
