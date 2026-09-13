import type { PickerValue } from '../types'
import type { DateTimeColumnType, DateTimeFields } from './types'

export const DEFAULT_DATE_TIME_FIELDS: DateTimeFields = {
  year: 1970,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
}

export function isLeapYear(year: number): boolean {
  const normalizedYear = Math.trunc(year)
  return normalizedYear % 4 === 0 && (normalizedYear % 100 !== 0 || normalizedYear % 400 === 0)
}

export function getDaysInMonth(year: number, month: number): number {
  const normalizedYear = Math.trunc(year)
  const normalizedMonth = Math.trunc(month)
  if (!Number.isFinite(normalizedYear) || !Number.isFinite(normalizedMonth)) return 0
  if (normalizedMonth < 1 || normalizedMonth > 12) return 0
  const date = new Date(0)
  date.setFullYear(normalizedYear, normalizedMonth, 0)
  return date.getDate()
}

export function dateToFields(date: Date): DateTimeFields {
  return {
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    month: date.getMonth() + 1,
    second: date.getSeconds(),
    year: date.getFullYear(),
  }
}

export function fieldsToDate(fields: DateTimeFields): Date {
  const date = new Date(0)
  date.setFullYear(fields.year, fields.month - 1, fields.day)
  date.setHours(fields.hour, fields.minute, fields.second, 0)
  return date
}

export function normalizeDateTimeFields(fields: Partial<DateTimeFields>): DateTimeFields {
  const next = { ...DEFAULT_DATE_TIME_FIELDS, ...fields }
  const year = Number.isFinite(next.year) ? Math.trunc(next.year) : DEFAULT_DATE_TIME_FIELDS.year
  const month = Number.isFinite(next.month)
    ? Math.max(1, Math.min(12, Math.trunc(next.month)))
    : DEFAULT_DATE_TIME_FIELDS.month
  const day = Number.isFinite(next.day)
    ? Math.max(1, Math.min(getDaysInMonth(year, month), Math.trunc(next.day)))
    : DEFAULT_DATE_TIME_FIELDS.day
  const hour = Number.isFinite(next.hour)
    ? Math.max(0, Math.min(23, Math.trunc(next.hour)))
    : DEFAULT_DATE_TIME_FIELDS.hour
  const minute = Number.isFinite(next.minute)
    ? Math.max(0, Math.min(59, Math.trunc(next.minute)))
    : DEFAULT_DATE_TIME_FIELDS.minute
  const second = Number.isFinite(next.second)
    ? Math.max(0, Math.min(59, Math.trunc(next.second)))
    : DEFAULT_DATE_TIME_FIELDS.second

  return { day, hour, minute, month, second, year }
}

export function clampDateTimeFields(
  fields: Partial<DateTimeFields>,
  minDate?: Date,
  maxDate?: Date,
): DateTimeFields {
  const normalized = normalizeDateTimeFields(fields)
  const date = fieldsToDate(normalized)
  if (minDate && Number.isFinite(minDate.getTime()) && date.getTime() < minDate.getTime()) {
    return dateToFields(minDate)
  }
  if (maxDate && Number.isFinite(maxDate.getTime()) && date.getTime() > maxDate.getTime()) {
    return dateToFields(maxDate)
  }
  return normalized
}

function getNumericValue(value: PickerValue | undefined, fallback: number): number {
  const number = Number(value)
  return Number.isFinite(number) ? Math.trunc(number) : fallback
}

export function pickerValuesToFields(
  values: readonly PickerValue[],
  columnsType: readonly DateTimeColumnType[],
  base: DateTimeFields = DEFAULT_DATE_TIME_FIELDS,
): DateTimeFields {
  const fields = { ...base }
  columnsType.forEach((type, index) => {
    fields[type] = getNumericValue(values[index], fields[type])
  })
  return normalizeDateTimeFields(fields)
}

export function fieldsToPickerValues(
  fields: DateTimeFields,
  columnsType: readonly DateTimeColumnType[],
): number[] {
  return columnsType.map((type) => fields[type])
}

export function formatDateTimeValue(type: DateTimeColumnType, value: number): string {
  return type === 'year' ? String(value) : String(value).padStart(2, '0')
}

export function fieldsToSelectedValues(
  fields: DateTimeFields,
  columnsType: readonly DateTimeColumnType[],
): string[] {
  return columnsType.map((type) => formatDateTimeValue(type, fields[type]))
}

export function pickerValuesToSelectedValues(
  values: readonly PickerValue[],
  columnsType: readonly DateTimeColumnType[],
  base: DateTimeFields = DEFAULT_DATE_TIME_FIELDS,
): string[] {
  return fieldsToSelectedValues(pickerValuesToFields(values, columnsType, base), columnsType)
}

export function selectedValuesToPickerValues(
  values: readonly string[],
  columnsType: readonly DateTimeColumnType[],
): number[] {
  return columnsType.map((_, index) => {
    const value = Number(values[index])
    return Number.isFinite(value) ? Math.trunc(value) : Number.NaN
  })
}

export function fieldsKey(fields: DateTimeFields): string {
  return [fields.year, fields.month, fields.day, fields.hour, fields.minute, fields.second].join(
    ':',
  )
}
