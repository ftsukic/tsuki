import type { PickerColumnContext, PickerColumns, PickerOption, PickerValue } from '../types'
import {
  DEFAULT_DATE_TIME_FIELDS,
  clampDateTimeFields,
  fieldsToPickerValues,
  fieldsToSelectedValues,
  getDaysInMonth,
  normalizeDateTimeFields,
  pickerValuesToFields,
} from './value'
import { parseTime } from './normalize'
import type {
  DateTimeColumnFilter,
  DateTimeColumnFormatter,
  DateTimeColumnType,
  DateTimeFields,
} from './types'

export interface DateTimeColumnsConfig {
  columnsType: readonly DateTimeColumnType[]
  baseFields?: DateTimeFields
  minDate?: Date
  maxDate?: Date
  minHour?: number
  maxHour?: number
  minMinute?: number
  maxMinute?: number
  minSecond?: number
  maxSecond?: number
  minTime?: string
  maxTime?: string
  filter?: DateTimeColumnFilter
  formatter?: DateTimeColumnFormatter
  hourStep?: number
  minuteStep?: number
  secondStep?: number
}

interface NumericRange {
  min: number
  max: number
}

const NATURAL_RANGES: Record<DateTimeColumnType, NumericRange> = {
  day: { max: 31, min: 1 },
  hour: { max: 23, min: 0 },
  minute: { max: 59, min: 0 },
  month: { max: 12, min: 1 },
  second: { max: 59, min: 0 },
  year: { max: 9999, min: 1 },
}
const TIME_FIELD_ORDER = ['hour', 'minute', 'second'] as const

function sameDate(fields: DateTimeFields, date: Date): boolean {
  return (
    fields.year === date.getFullYear() &&
    fields.month === date.getMonth() + 1 &&
    fields.day === date.getDate()
  )
}

function resolveDateRange(
  type: DateTimeColumnType,
  fields: DateTimeFields,
  config: DateTimeColumnsConfig,
): NumericRange {
  const natural = NATURAL_RANGES[type]
  const minDate = config.minDate
  const maxDate = config.maxDate
  let min = natural.min
  let max = natural.max

  if (type === 'year') {
    min = minDate?.getFullYear() ?? natural.min
    max = maxDate?.getFullYear() ?? natural.max
  } else if (type === 'month') {
    min = fields.year === minDate?.getFullYear() ? minDate!.getMonth() + 1 : natural.min
    max = fields.year === maxDate?.getFullYear() ? maxDate!.getMonth() + 1 : natural.max
  } else if (type === 'day') {
    min =
      fields.year === minDate?.getFullYear() && fields.month === minDate.getMonth() + 1
        ? minDate.getDate()
        : natural.min
    max =
      fields.year === maxDate?.getFullYear() && fields.month === maxDate.getMonth() + 1
        ? maxDate.getDate()
        : getDaysInMonth(fields.year, fields.month)
  } else if (type === 'hour') {
    min = minDate && sameDate(fields, minDate) ? minDate.getHours() : natural.min
    max = maxDate && sameDate(fields, maxDate) ? maxDate.getHours() : natural.max
  } else if (type === 'minute') {
    const sameMinHour = !!minDate && sameDate(fields, minDate) && fields.hour === minDate.getHours()
    const sameMaxHour = !!maxDate && sameDate(fields, maxDate) && fields.hour === maxDate.getHours()
    min = sameMinHour ? minDate!.getMinutes() : natural.min
    max = sameMaxHour ? maxDate!.getMinutes() : natural.max
  } else {
    const sameMinMinute =
      !!minDate &&
      sameDate(fields, minDate) &&
      fields.hour === minDate.getHours() &&
      fields.minute === minDate.getMinutes()
    const sameMaxMinute =
      !!maxDate &&
      sameDate(fields, maxDate) &&
      fields.hour === maxDate.getHours() &&
      fields.minute === maxDate.getMinutes()
    min = sameMinMinute ? minDate!.getSeconds() : natural.min
    max = sameMaxMinute ? maxDate!.getSeconds() : natural.max
  }

  return {
    max: Math.min(natural.max, max),
    min: Math.max(natural.min, min),
  }
}

function normalizeNumber(value: number | undefined, fallback: number, range: NumericRange): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(range.max, Math.max(range.min, Math.trunc(value as number)))
}

function normalizeStep(value: number | undefined): number {
  return Number.isFinite(value) && Number(value) > 0 ? Math.max(1, Math.trunc(Number(value))) : 1
}

function resolveTimeRange(
  type: Extract<DateTimeColumnType, 'hour' | 'minute' | 'second'>,
  fields: DateTimeFields,
  config: DateTimeColumnsConfig,
): NumericRange {
  const natural = NATURAL_RANGES[type]
  const minTime = parseTime(config.minTime)
  const maxTime = parseTime(config.maxTime)
  let min = natural.min
  let max = natural.max

  if (minTime) {
    if (type === 'hour') min = minTime.hour
    if (type === 'minute') min = fields.hour <= minTime.hour ? minTime.minute : natural.min
    if (type === 'second') {
      min =
        fields.hour <= minTime.hour && fields.minute <= minTime.minute
          ? minTime.second
          : natural.min
    }
  } else if (type === 'hour') {
    min = normalizeNumber(config.minHour, natural.min, natural)
  } else if (type === 'minute') {
    min = normalizeNumber(config.minMinute, natural.min, natural)
  } else {
    min = normalizeNumber(config.minSecond, natural.min, natural)
  }

  if (maxTime) {
    if (type === 'hour') max = maxTime.hour
    if (type === 'minute') max = fields.hour >= maxTime.hour ? maxTime.minute : natural.max
    if (type === 'second') {
      max =
        fields.hour >= maxTime.hour && fields.minute >= maxTime.minute
          ? maxTime.second
          : natural.max
    }
  } else if (type === 'hour') {
    max = normalizeNumber(config.maxHour, natural.max, natural)
  } else if (type === 'minute') {
    max = normalizeNumber(config.maxMinute, natural.max, natural)
  } else {
    max = normalizeNumber(config.maxSecond, natural.max, natural)
  }

  return {
    max: Math.min(natural.max, max),
    min: Math.max(natural.min, min),
  }
}

function resolveRange(
  type: DateTimeColumnType,
  fields: DateTimeFields,
  config: DateTimeColumnsConfig,
): NumericRange {
  if (config.minDate || config.maxDate) {
    return resolveDateRange(type, fields, config)
  }
  if (type === 'year' || type === 'month' || type === 'day') {
    return resolveDateRange(type, fields, config)
  }
  if (
    config.minTime ||
    config.maxTime ||
    config.minHour !== undefined ||
    config.maxHour !== undefined ||
    config.minMinute !== undefined ||
    config.maxMinute !== undefined ||
    config.minSecond !== undefined ||
    config.maxSecond !== undefined
  ) {
    return resolveTimeRange(type, fields, config)
  }
  return NATURAL_RANGES[type]
}

function getStep(type: DateTimeColumnType, config: DateTimeColumnsConfig): number {
  if (type === 'hour') return normalizeStep(config.hourStep)
  if (type === 'minute') return normalizeStep(config.minuteStep)
  if (type === 'second') return normalizeStep(config.secondStep)
  return 1
}

function createOptions(
  type: DateTimeColumnType,
  range: NumericRange,
  step: number,
): PickerOption[] {
  const natural = NATURAL_RANGES[type]
  const start = Math.min(natural.max, Math.max(natural.min, range.min))
  const end = Math.min(natural.max, Math.max(natural.min, range.max))
  const first = Math.ceil(start / step) * step
  const values =
    first <= end
      ? Array.from(
          { length: Math.floor((end - first) / step) + 1 },
          (_, index) => first + index * step,
        )
      : []

  return values.map((value) => ({
    text: type === 'year' ? String(value) : String(value).padStart(2, '0'),
    value,
  }))
}

function hasTimeConstraint(config: DateTimeColumnsConfig): boolean {
  return Boolean(
    config.minTime ||
    config.maxTime ||
    config.minHour !== undefined ||
    config.maxHour !== undefined ||
    config.minMinute !== undefined ||
    config.maxMinute !== undefined ||
    config.minSecond !== undefined ||
    config.maxSecond !== undefined ||
    config.hourStep !== undefined ||
    config.minuteStep !== undefined ||
    config.secondStep !== undefined,
  )
}

function getTimeInSeconds(fields: DateTimeFields): number {
  return fields.hour * 60 * 60 + fields.minute * 60 + fields.second
}

function withTimeInSeconds(fields: DateTimeFields, seconds: number): DateTimeFields {
  const normalized = Math.max(0, Math.min(24 * 60 * 60 - 1, Math.trunc(seconds)))
  const hour = Math.floor(normalized / (60 * 60))
  const minute = Math.floor((normalized % (60 * 60)) / 60)
  const second = normalized % 60
  return { ...fields, hour, minute, second }
}

function getNearestOptionValue(
  type: Extract<DateTimeColumnType, 'hour' | 'minute' | 'second'>,
  fields: DateTimeFields,
  config: DateTimeColumnsConfig,
): number | undefined {
  const options = createOptions(type, resolveRange(type, fields, config), getStep(type, config))
  if (options.length === 0) return undefined
  const requested = fields[type]
  return options.reduce(
    (nearest, option) => {
      if (nearest === undefined) return Number(option.value)
      return Math.abs(Number(option.value) - requested) < Math.abs(nearest - requested)
        ? Number(option.value)
        : nearest
    },
    undefined as number | undefined,
  )
}

function normalizeRequestedFields(
  fields: DateTimeFields,
  config: DateTimeColumnsConfig,
): DateTimeFields {
  let normalized = normalizeDateTimeFields(fields)

  if (config.minDate || config.maxDate) {
    normalized = clampDateTimeFields(normalized, config.minDate, config.maxDate)
  }

  if (!hasTimeConstraint(config)) return normalized

  const minTime = parseTime(config.minTime)
  const maxTime = parseTime(config.maxTime)
  if (minTime || maxTime) {
    const currentSeconds = getTimeInSeconds(normalized)
    const minSeconds = minTime ? getTimeInSeconds(minTime) : 0
    const maxSeconds = maxTime ? getTimeInSeconds(maxTime) : 24 * 60 * 60 - 1
    normalized = withTimeInSeconds(
      normalized,
      Math.min(maxSeconds, Math.max(minSeconds, currentSeconds)),
    )
  }

  // Resolve time values in semantic order. The generated range may still depend on
  // the current complete fields, so do a second pass after the first correction.
  for (let pass = 0; pass < 2; pass += 1) {
    if (minTime || maxTime) {
      const currentSeconds = getTimeInSeconds(normalized)
      const minSeconds = minTime ? getTimeInSeconds(minTime) : 0
      const maxSeconds = maxTime ? getTimeInSeconds(maxTime) : 24 * 60 * 60 - 1
      normalized = withTimeInSeconds(
        normalized,
        Math.min(maxSeconds, Math.max(minSeconds, currentSeconds)),
      )
    }

    TIME_FIELD_ORDER.forEach((type) => {
      const value = getNearestOptionValue(type, normalized, config)
      if (value !== undefined) normalized = { ...normalized, [type]: value }
    })

    if (config.minDate || config.maxDate) {
      normalized = clampDateTimeFields(normalized, config.minDate, config.maxDate)
    }
  }

  return normalized
}

function resolveRequestedValues(
  context: PickerColumnContext,
  columnsType: readonly DateTimeColumnType[],
): readonly PickerValue[] {
  const values = [...(context.requestedValues ?? context.selectedValues)]
  context.selectedValues.forEach((value, index) => {
    values[index] = value
  })
  return values.slice(0, columnsType.length)
}

function formatOptions(
  type: DateTimeColumnType,
  options: readonly PickerOption[],
  config: DateTimeColumnsConfig,
): PickerOption[] {
  return options.map((option) => {
    const result = config.formatter?.(type, option) ?? option
    if (typeof result === 'string') return { ...option, text: result }
    return { ...option, ...result, value: option.value }
  })
}

function resolveOptions(
  type: DateTimeColumnType,
  fields: DateTimeFields,
  config: DateTimeColumnsConfig,
): PickerOption[] {
  const options = createOptions(type, resolveRange(type, fields, config), getStep(type, config))
  const formatted = formatOptions(type, options, config)
  const values = fieldsToSelectedValues(fields, config.columnsType)
  const filtered = config.filter?.(type, formatted, values) ?? formatted

  return filtered.flatMap((option) => {
    const canonical = options.find((item) => Object.is(item.value, option.value))
    return canonical ? [{ ...option, value: canonical.value }] : []
  })
}

export function createDateTimeColumns(config: DateTimeColumnsConfig): PickerColumns {
  const baseFields = config.baseFields ?? DEFAULT_DATE_TIME_FIELDS
  const canonicalFieldsCache = new WeakMap<object, DateTimeFields>()

  return config.columnsType.map((type) => (context: PickerColumnContext) => {
    const values = resolveRequestedValues(context, config.columnsType)
    const requestedReference = context.requestedValues ?? context.selectedValues
    const cachedFields =
      requestedReference && typeof requestedReference === 'object'
        ? canonicalFieldsCache.get(requestedReference)
        : undefined
    const requestedFields = cachedFields
      ? { ...cachedFields }
      : normalizeRequestedFields(
          pickerValuesToFields(values, config.columnsType, baseFields),
          config,
        )

    if (!cachedFields && requestedReference && typeof requestedReference === 'object') {
      canonicalFieldsCache.set(requestedReference, requestedFields)
    }

    // The generic Picker resolves columns in visual order. Apply only the already
    // resolved prefix to the complete semantic fields, preserving the canonical
    // correction for fields that appear later in a reordered layout.
    context.selectedValues.forEach((value, index) => {
      const numericValue = Number(value)
      if (Number.isFinite(numericValue) && config.columnsType[index]) {
        requestedFields[config.columnsType[index]] = Math.trunc(numericValue)
      }
    })

    const fields = normalizeRequestedFields(requestedFields, config)
    return resolveOptions(type, fields, config)
  })
}

export function normalizeDateTimePickerValues(
  values: readonly PickerValue[],
  config: DateTimeColumnsConfig,
): number[] {
  const baseFields = config.baseFields ?? DEFAULT_DATE_TIME_FIELDS
  const fields = pickerValuesToFields(values, config.columnsType, baseFields)
  return fieldsToPickerValues(normalizeRequestedFields(fields, config), config.columnsType)
}
