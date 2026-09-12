import type { PickerValue } from '../picker/types'
import {
  clampDateTimeFields,
  dateToFields,
  fieldsToDate,
  fieldsToPickerValues,
  pickerValuesToFields,
} from '../picker/date-time/value'
import type { DateTimeColumnType } from '../picker/date-time/types'
import type { DateTimePickerColumnType, DateTimePickerFormatter } from './types'

export interface DateTimePickerDateRange {
  minDate: Date
  maxDate: Date
}

const COLUMNS_TYPE = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
] as const satisfies readonly DateTimeColumnType[]

export function isValidDateTime(value: Date | undefined): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime())
}

export function getDefaultDateTimeRange(referenceDate = new Date()): DateTimePickerDateRange {
  const year = referenceDate.getFullYear()
  return {
    maxDate: new Date(year + 10, 11, 31, 23, 59, 59),
    minDate: new Date(year - 10, 0, 1, 0, 0, 0),
  }
}

export function normalizeDateTimeRange(
  minDate?: Date,
  maxDate?: Date,
  referenceDate = new Date(),
): DateTimePickerDateRange {
  const defaults = getDefaultDateTimeRange(referenceDate)
  const min = new Date((isValidDateTime(minDate) ? minDate : defaults.minDate).getTime())
  const max = new Date((isValidDateTime(maxDate) ? maxDate : defaults.maxDate).getTime())
  return min.getTime() <= max.getTime()
    ? { maxDate: max, minDate: min }
    : { maxDate: max, minDate: max }
}

export function clampDateTime(value: Date, minDate: Date, maxDate: Date): Date {
  const date = new Date((isValidDateTime(value) ? value : minDate).getTime())
  if (date.getTime() < minDate.getTime()) return new Date(minDate.getTime())
  if (date.getTime() > maxDate.getTime()) return new Date(maxDate.getTime())
  return date
}

export function getDateTimePickerValues(date: Date): number[] {
  return fieldsToPickerValues(dateToFields(date), COLUMNS_TYPE)
}

export function createDateTimeFromPickerValues(
  values: readonly PickerValue[],
  baseDate: Date,
  minDate: Date,
  maxDate: Date,
): Date {
  const fields = pickerValuesToFields(values, COLUMNS_TYPE, dateToFields(baseDate))
  const normalized = clampDateTimeFields(fields, minDate, maxDate)
  return clampDateTime(fieldsToDate(normalized), minDate, maxDate)
}

export function getDateTimePickerColumnTypes(): readonly DateTimeColumnType[] {
  return COLUMNS_TYPE
}

export type { DateTimePickerColumnType, DateTimePickerFormatter }
