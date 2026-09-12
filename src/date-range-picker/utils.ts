import type { PickerValue } from '../picker/types'
import {
  clampDate,
  createDateFromPickerValues,
  getDatePickerValues,
  getDefaultDateRange,
  isValidDate,
  startOfDate,
} from '../date-picker/utils'
import type { DateRangePickerPart, DateRangePickerValue } from './types'

export interface DateRangePickerBounds {
  minDate: Date
  maxDate: Date
}

export interface DateRangePickerEditBounds {
  minDate: Date
  maxDate: Date
}

export function normalizeDateRangePickerBounds(
  minDate?: Date,
  maxDate?: Date,
  referenceDate = new Date(),
): DateRangePickerBounds {
  const defaults = getDefaultDateRange(referenceDate)
  const min = startOfDate(isValidDate(minDate) ? minDate : defaults.minDate)
  const max = startOfDate(isValidDate(maxDate) ? maxDate : defaults.maxDate)

  return min.getTime() <= max.getTime()
    ? { maxDate: max, minDate: min }
    : { maxDate: max, minDate: max }
}

export function isDateRangePickerValue(value: unknown): value is DateRangePickerValue {
  return (
    Array.isArray(value) && value.length === 2 && isValidDate(value[0]) && isValidDate(value[1])
  )
}

function getRangeValue(value: unknown, index: 0 | 1): unknown {
  return Array.isArray(value) ? value[index] : undefined
}

export function normalizeDateRangePickerValue(
  value: unknown,
  bounds: DateRangePickerBounds,
  referenceDate = new Date(),
): DateRangePickerValue {
  const reference = clampDate(referenceDate, bounds.minDate, bounds.maxDate)
  const start = clampDate(
    isValidDate(getRangeValue(value, 0) as Date | undefined)
      ? (getRangeValue(value, 0) as Date)
      : reference,
    bounds.minDate,
    bounds.maxDate,
  )
  const end = clampDate(
    isValidDate(getRangeValue(value, 1) as Date | undefined)
      ? (getRangeValue(value, 1) as Date)
      : start,
    bounds.minDate,
    bounds.maxDate,
  )

  return end.getTime() < start.getTime()
    ? [new Date(start.getTime()), new Date(start.getTime())]
    : [new Date(start.getTime()), new Date(end.getTime())]
}

export function clampDateRangePickerValue(
  value: DateRangePickerValue,
  bounds: DateRangePickerBounds,
): DateRangePickerValue {
  return normalizeDateRangePickerValue(value, bounds, value[0])
}

export function areDateRangesEqual(left: unknown, right: unknown): boolean {
  return (
    isDateRangePickerValue(left) &&
    isDateRangePickerValue(right) &&
    left[0].getTime() === right[0].getTime() &&
    left[1].getTime() === right[1].getTime()
  )
}

export function getDateRangePickerEditBounds(
  part: DateRangePickerPart,
  range: DateRangePickerValue,
  bounds: DateRangePickerBounds,
): DateRangePickerEditBounds {
  return part === 'start'
    ? { maxDate: range[1], minDate: bounds.minDate }
    : { maxDate: bounds.maxDate, minDate: range[0] }
}

export function createDateRangePickerDate(
  values: readonly PickerValue[],
  baseDate: Date,
  bounds: DateRangePickerEditBounds,
): Date {
  return createDateFromPickerValues(values, baseDate, 'date', bounds.minDate, bounds.maxDate)
}

export function getDateRangePickerValues(value: Date): number[] {
  return getDatePickerValues(value, 'date')
}

export function formatDateRangePickerDate(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`
}
