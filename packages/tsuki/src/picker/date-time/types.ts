import type { PickerOption } from '../types'

export type DateTimeColumnType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

export interface DateTimeFields {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export type DateTimeColumnFormatter = (
  type: DateTimeColumnType,
  option: PickerOption,
) => PickerOption | string

export type DateTimeColumnFilter = (
  type: DateTimeColumnType,
  options: readonly PickerOption[],
  values: readonly string[],
) => readonly PickerOption[]

export interface DateTimeTimeRange {
  min?: string
  max?: string
}
