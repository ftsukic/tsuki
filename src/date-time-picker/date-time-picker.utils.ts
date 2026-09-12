import type { PickerColumns, PickerOption, PickerValue } from '../picker/types'
import { createTemporalColumns } from '../temporal-picker/columns'
import {
  dateToTemporalFields,
  pickerValuesToTemporalFields,
  temporalFieldsToDate,
  temporalFieldsToPickerValues,
} from '../temporal-picker/value'
import type { DateTimePickerColumnType, DateTimePickerFormatter } from './date-time-picker.types'

export interface DateTimePickerDateRange {
  minDate: Date
  maxDate: Date
}

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
  return temporalFieldsToPickerValues(dateToTemporalFields(date), [
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
  ])
}

export function createDateTimeFromPickerValues(
  values: readonly PickerValue[],
  baseDate: Date,
  minDate: Date,
  maxDate: Date,
): Date {
  const fields = pickerValuesToTemporalFields(
    values,
    ['year', 'month', 'day', 'hour', 'minute', 'second'],
    dateToTemporalFields(baseDate),
  )
  return clampDateTime(temporalFieldsToDate(fields), minDate, maxDate)
}

function dateFormatter(formatter?: DateTimePickerFormatter) {
  return formatter
    ? (type: DateTimePickerColumnType, option: PickerOption) => ({
        ...option,
        text: formatter(type, Number(option.value)),
      })
    : undefined
}

export function generateDateTimeColumns(
  minDate?: Date,
  maxDate?: Date,
  formatter?: DateTimePickerFormatter,
): PickerColumns {
  const range = normalizeDateTimeRange(minDate, maxDate)
  return createTemporalColumns({
    columnsType: ['year', 'month', 'day', 'hour', 'minute', 'second'],
    formatter: dateFormatter(formatter),
    maxDate: range.maxDate,
    minDate: range.minDate,
  })
}
