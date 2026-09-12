import type {
  PickerColumnContext,
  PickerColumnSource,
  PickerColumns,
  PickerOption,
  PickerValue,
} from '../picker/types'
import { createTemporalColumns } from '../temporal-picker/columns'
import {
  dateToTemporalFields,
  pickerValuesToTemporalFields,
  temporalFieldsToDate,
  temporalFieldsToPickerValues,
} from '../temporal-picker/value'
import type { TemporalColumnType, TemporalFormatter } from '../temporal-picker/types'
import type { DatePickerColumnType, DatePickerFormatter, DatePickerType } from './date-picker.types'

export interface DatePickerDateRange {
  minDate: Date
  maxDate: Date
}

export interface GenerateDateColumnsOptions {
  minDate?: Date
  maxDate?: Date
  type?: DatePickerType
  formatter?: DatePickerFormatter
}

const DEFAULT_DATE_RANGE_YEARS = 10

export function isLeapYear(year: number): boolean {
  const normalizedYear = Math.trunc(year)
  return normalizedYear % 4 === 0 && (normalizedYear % 100 !== 0 || normalizedYear % 400 === 0)
}

export function getDaysInMonth(year: number, month: number): number {
  const normalizedYear = Math.trunc(year)
  const normalizedMonth = Math.trunc(month)
  if (!Number.isFinite(normalizedYear) || !Number.isFinite(normalizedMonth)) return 0
  if (normalizedMonth < 1 || normalizedMonth > 12) return 0
  return new Date(normalizedYear, normalizedMonth, 0).getDate()
}

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
  return temporalFieldsToPickerValues(dateToTemporalFields(date), getDatePickerColumnTypes(type))
}

export function createDateFromPickerValues(
  values: readonly PickerValue[],
  baseDate: Date,
  type: DatePickerType,
  minDate: Date,
  maxDate: Date,
): Date {
  const columnsType = getDatePickerColumnTypes(type)
  const fields = pickerValuesToTemporalFields(values, columnsType, dateToTemporalFields(baseDate))
  return clampDate(temporalFieldsToDate(fields), minDate, maxDate)
}

function getColumnOptions(
  columns: PickerColumns,
  selectedValues: readonly PickerValue[] = [],
): PickerOption[] {
  const source = (columns as readonly PickerColumnSource[])[0]
  if (!source) return []
  const context: PickerColumnContext = {
    indexes: [],
    selectedIndexes: [],
    selectedOptions: [],
    selectedValues,
    values: selectedValues,
  }
  return typeof source === 'function' ? [...(source(context) ?? [])] : [...source]
}

function dateFormatter(formatter?: DatePickerFormatter): TemporalFormatter | undefined {
  return formatter
    ? (type: TemporalColumnType, option: PickerOption) => ({
        ...option,
        text: formatter(type as DatePickerColumnType, Number(option.value)),
      })
    : undefined
}

export function generateYearColumns(
  minDate?: Date,
  maxDate?: Date,
  formatter?: DatePickerFormatter,
): PickerOption[] {
  const range = normalizeDateRange(minDate, maxDate)
  return getColumnOptions(
    createTemporalColumns({
      columnsType: ['year'],
      formatter: dateFormatter(formatter),
      maxDate: range.maxDate,
      minDate: range.minDate,
    }),
  )
}

export function generateMonthColumns(
  year: number,
  minDate?: Date,
  maxDate?: Date,
  formatter?: DatePickerFormatter,
): PickerOption[] {
  const range = normalizeDateRange(minDate, maxDate)
  return getColumnOptions(
    createTemporalColumns({
      columnsType: ['year', 'month'],
      formatter: dateFormatter(formatter),
      maxDate: range.maxDate,
      minDate: range.minDate,
    }).slice(1),
    [year],
  )
}

export function generateDayColumns(
  year: number,
  month: number,
  minDate?: Date,
  maxDate?: Date,
  formatter?: DatePickerFormatter,
): PickerOption[] {
  const range = normalizeDateRange(minDate, maxDate)
  const columns = createTemporalColumns({
    columnsType: ['year', 'month', 'day'],
    formatter: dateFormatter(formatter),
    maxDate: range.maxDate,
    minDate: range.minDate,
  })
  const source = columns[2]
  if (typeof source !== 'function') return []
  return [
    ...(source({
      indexes: [],
      selectedIndexes: [],
      selectedOptions: [],
      selectedValues: [year, month],
      values: [year, month],
    }) ?? []),
  ]
}

export function generateDateColumns(options: GenerateDateColumnsOptions = {}): PickerColumns {
  const range = normalizeDateRange(options.minDate, options.maxDate)
  return createTemporalColumns({
    columnsType: getDatePickerColumnTypes(options.type),
    formatter: dateFormatter(options.formatter),
    maxDate: range.maxDate,
    minDate: range.minDate,
  })
}
