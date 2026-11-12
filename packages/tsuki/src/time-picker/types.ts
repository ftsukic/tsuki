import type { ReactNode } from 'react'
import type { PickerOption, PickerProps } from '../picker/types'

export type TimePickerColumnType = 'hour' | 'minute' | 'second'
export type TimePickerValue = readonly string[]
export type TimePickerOption = PickerOption
export type TimePickerFormatter = (
  type: TimePickerColumnType,
  option: TimePickerOption,
) => TimePickerOption | string
export type TimePickerFilter = (
  type: TimePickerColumnType,
  options: readonly TimePickerOption[],
  values: TimePickerValue,
) => readonly TimePickerOption[]

export interface TimePickerSelection {
  values: TimePickerValue
  options: readonly TimePickerOption[]
  indexes: readonly number[]
}

export interface TimePickerRef {
  confirm(): TimePickerSelection
  cancel(): void
  getSelectedValues(): TimePickerValue
  getSelectedOptions(): readonly TimePickerOption[]
}
export interface TimePickerProps extends Omit<
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
  value?: TimePickerValue
  defaultValue?: TimePickerValue
  columnsType?: readonly TimePickerColumnType[]
  minHour?: number
  maxHour?: number
  minMinute?: number
  maxMinute?: number
  minSecond?: number
  maxSecond?: number
  minTime?: string
  maxTime?: string
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  title?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonText?: ReactNode
  formatter?: TimePickerFormatter
  filter?: TimePickerFilter
  onChange?(value: TimePickerValue, options: readonly TimePickerOption[]): void
  onConfirm?(value: TimePickerValue, options: readonly TimePickerOption[]): void
  onCancel?(): void
}
