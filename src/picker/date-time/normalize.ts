import type { DateTimeColumnType, DateTimeFields } from './types'

const DATE_COLUMN_TYPES = ['year', 'month', 'day'] as const
const TIME_COLUMN_TYPES = ['hour', 'minute', 'second'] as const
const DATE_TIME_ORDER = ['year', 'month', 'day', 'hour', 'minute', 'second'] as const

export function normalizeColumnTypes<T extends string>(
  value: readonly T[],
  allowed: readonly string[],
  componentName: string,
): readonly T[] {
  const normalized: T[] = []
  value.forEach((type) => {
    if (!allowed.includes(type)) {
      throw new Error(`${componentName}: unsupported columns type: ${String(type)}`)
    }
    if (!normalized.includes(type)) normalized.push(type)
  })
  return normalized
}

export function validateDateTimeColumnOrder<T extends string>(value: readonly T[]): readonly T[] {
  let previous = -1
  value.forEach((type) => {
    const index = DATE_TIME_ORDER.indexOf(type as (typeof DATE_TIME_ORDER)[number])
    if (index < 0 || index <= previous) {
      throw new Error(
        'DateTimePicker: columnsType must follow year -> month -> day -> hour -> minute -> second',
      )
    }
    previous = index
  })
  return value
}

export function normalizeDatePickerBounds(
  minDate?: Date,
  maxDate?: Date,
  referenceDate = new Date(),
) {
  const currentYear = referenceDate.getFullYear()
  const min = new Date(
    (isValidDate(minDate) ? minDate : new Date(currentYear - 10, 0, 1)).getTime(),
  )
  const max = new Date(
    (isValidDate(maxDate) ? maxDate : new Date(currentYear + 10, 11, 31)).getTime(),
  )
  min.setHours(0, 0, 0, 0)
  max.setHours(23, 59, 59, 999)
  return min.getTime() <= max.getTime()
    ? { maxDate: max, minDate: min }
    : { maxDate: max, minDate: max }
}

export function normalizeDateTimeBounds(
  minDate?: Date,
  maxDate?: Date,
  referenceDate = new Date(),
) {
  const currentYear = referenceDate.getFullYear()
  const min = new Date(
    (isValidDate(minDate) ? minDate : new Date(currentYear - 10, 0, 1)).getTime(),
  )
  const max = new Date(
    (isValidDate(maxDate) ? maxDate : new Date(currentYear + 10, 11, 31, 23, 59, 59)).getTime(),
  )
  return min.getTime() <= max.getTime()
    ? { maxDate: max, minDate: min }
    : { maxDate: max, minDate: max }
}

export function isValidDate(value: Date | undefined): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime())
}

export function parseTime(value?: string): DateTimeFields | undefined {
  if (!value) return undefined
  const match = /^(\d{2}):(\d{2}):(\d{2})$/u.exec(value)
  if (!match) return undefined
  const hour = Number(match[1])
  const minute = Number(match[2])
  const second = Number(match[3])
  if (hour > 23 || minute > 59 || second > 59) return undefined
  return { day: 1, hour, minute, month: 1, second, year: 1970 }
}

export function dateColumnTypes(): readonly DateTimeColumnType[] {
  return DATE_COLUMN_TYPES
}

export function timeColumnTypes(): readonly DateTimeColumnType[] {
  return TIME_COLUMN_TYPES
}
