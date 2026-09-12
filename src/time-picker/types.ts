import type { PickerAction, PickerOption, PickerProps } from '../picker/types'
import type { TemporalColumnType } from '../temporal-picker/types'

export type TimePickerColumnType = Extract<TemporalColumnType, 'hour' | 'minute' | 'second'>

export type TimePickerValue = readonly string[]

export interface TimePickerOption extends PickerOption {
  value: string
}

export type TimePickerFilter = (
  type: TimePickerColumnType,
  options: readonly TimePickerOption[],
  values: TimePickerValue,
) => readonly TimePickerOption[]

export type TimePickerFormatter = (
  type: TimePickerColumnType,
  option: TimePickerOption,
) => TimePickerOption

export interface TimePickerProps extends Omit<
  PickerProps,
  'columns' | 'value' | 'defaultValue' | 'onChange' | 'onConfirm'
> {
  columnsType?: readonly TimePickerColumnType[]
  value?: TimePickerValue
  defaultValue?: TimePickerValue
  minHour?: number
  maxHour?: number
  minMinute?: number
  maxMinute?: number
  minSecond?: number
  maxSecond?: number
  filter?: TimePickerFilter
  formatter?: TimePickerFormatter
  onChange?: (values: TimePickerValue, options: readonly TimePickerOption[]) => void
  onConfirm?: (values: TimePickerValue, options: readonly TimePickerOption[]) => void
}

export type TimePickerAction = PickerAction

export interface TimePickerResult {
  action: TimePickerAction
  values: TimePickerValue
  options: readonly TimePickerOption[]
}

export type TimePickerOptions = Omit<TimePickerProps, 'visible'>
