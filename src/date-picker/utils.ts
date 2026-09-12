import type { PickerValue } from '../picker/types'
import {
  clampDateTimeFields,
  dateToFields,
  fieldsToDate,
  fieldsToPickerValues,
  pickerValuesToFields,
} from '../picker/date-time/value'
import type { DatePickerColumnType, DatePickerType } from './types'

export interface DatePickerDateRange {
  minDate: Date
  maxDate: Date
}

export { getDaysInMonth, isLeapYear } from '../picker/date-time/value'

const DEFAULT_DATE_RANGE_YEARS = 10

export function isValidDate(value: Date | undefined): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime())
}

export function startOfDate(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

export function getDefaultDateRange(referenceDate = new Date()): DatePickerDateRange {
  const year = referenceDate.getFullYear()
  return {
    maxDate: new Date(year + DEFAULT_DATE_RANGE_YEARS, 11, 31),
    minDate: new Date(year - DEFAULT_DATE_RANGE_YEARS, 0, 1),
  }
}

export function normalizeDateRange(
  minDate?: Date,
  maxDate?: Date,
  referenceDate = new Date(),
): DatePickerDateRange {
  const defaults = getDefaultDateRange(referenceDate)
  const min = startOfDate(isValidDate(minDate) ? minDate : defaults.minDate)
  const max = startOfDate(isValidDate(maxDate) ? maxDate : defaults.maxDate)
  return min.getTime() <= max.getTime()
    ? { maxDate: max, minDate: min }
    : { maxDate: max, minDate: max }
}

export function clampDate(value: Date, minDate: Date, maxDate: Date): Date {
  const date = startOfDate(isValidDate(value) ? value : minDate)
  if (date.getTime() < minDate.getTime()) return new Date(minDate.getTime())
  if (date.getTime() > maxDate.getTime()) return new Date(maxDate.getTime())
  return date
}

export function getDatePickerColumnTypes(type: DatePickerType = 'date'): DatePickerColumnType[] {
  switch (type) {
    case 'year':
      return ['year']
    case 'year-month':
      return ['year', 'month']
    default:
      return ['year', 'month', 'day']
  }
}

export function getDatePickerValues(date: Date, type: DatePickerType = 'date'): number[] {
  return fieldsToPickerValues(dateToFields(date), getDatePickerColumnTypes(type))
}

export function createDateFromPickerValues(
  values: readonly PickerValue[],
  baseDate: Date,
  type: DatePickerType,
  minDate: Date,
  maxDate: Date,
): Date {
  const fields = pickerValuesToFields(
    values,
    getDatePickerColumnTypes(type),
    dateToFields(baseDate),
  )
  const normalized = clampDateTimeFields(fields, minDate, maxDate)
  return clampDate(fieldsToDate(normalized), minDate, maxDate)
}
