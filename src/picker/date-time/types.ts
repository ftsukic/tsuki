import type { PickerOption, PickerValue } from '../types'

export type DateTimeColumnType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

export interface DateTimeFields {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface DateTimeLimit {
  min?: number
  max?: number
}

export type DateTimeLimits = Partial<Record<DateTimeColumnType, DateTimeLimit>>

export type DateTimeColumnFormatter = (
  type: DateTimeColumnType,
  option: PickerOption,
  fields: DateTimeFields,
) => PickerOption

export type DateTimeColumnFilter = (
  type: DateTimeColumnType,
  options: readonly PickerOption[],
  fields: DateTimeFields,
  selectedValues: readonly PickerValue[],
) => readonly PickerOption[]
