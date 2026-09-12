import type { PickerOption, PickerValue } from '../picker/types'

export type TemporalColumnType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

export interface TemporalFields {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface TemporalLimit {
  min?: number
  max?: number
}

export type TemporalLimits = Partial<Record<TemporalColumnType, TemporalLimit>>

export type TemporalFormatter = (
  type: TemporalColumnType,
  option: PickerOption,
  fields: TemporalFields,
) => PickerOption

export type TemporalFilter = (
  type: TemporalColumnType,
  options: readonly PickerOption[],
  fields: TemporalFields,
  selectedValues: readonly PickerValue[],
) => readonly PickerOption[]
