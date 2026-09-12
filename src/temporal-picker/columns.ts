import type { PickerColumnContext, PickerColumns, PickerOption, PickerValue } from '../picker/types'
import { DEFAULT_TEMPORAL_FIELDS, pickerValuesToTemporalFields } from './value'
import type {
  TemporalColumnType,
  TemporalFields,
  TemporalFilter,
  TemporalFormatter,
  TemporalLimits,
} from './types'

export interface TemporalColumnsConfig {
  columnsType: readonly TemporalColumnType[]
  minDate?: Date
  maxDate?: Date
  limits?: TemporalLimits
  filter?: TemporalFilter
  formatter?: TemporalFormatter
  timeSuffix?: boolean
}

interface NumericRange {
  min: number
  max: number
}

const NATURAL_RANGES: Record<TemporalColumnType, NumericRange> = {
  day: { max: 31, min: 1 },
  hour: { max: 23, min: 0 },
  minute: { max: 59, min: 0 },
  month: { max: 12, min: 1 },
  second: { max: 59, min: 0 },
  year: { max: 9999, min: 1 },
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function sameDate(left: TemporalFields, right: Date): boolean {
  return (
    left.year === right.getFullYear() &&
    left.month === right.getMonth() + 1 &&
    left.day === right.getDate()
  )
}

function resolveDateRange(
  type: TemporalColumnType,
  fields: TemporalFields,
  config: TemporalColumnsConfig,
) {
  const natural = NATURAL_RANGES[type]
  const minDate = config.minDate
  const maxDate = config.maxDate
  let min = natural.min
  let max = natural.max

  if (type === 'year') {
    min = minDate?.getFullYear() ?? natural.min
    max = maxDate?.getFullYear() ?? natural.max
  } else if (type === 'month') {
    min = fields.year === minDate?.getFullYear() ? minDate.getMonth() + 1 : natural.min
    max = fields.year === maxDate?.getFullYear() ? maxDate.getMonth() + 1 : natural.max
  } else if (type === 'day') {
    min =
      fields.year === minDate?.getFullYear() && fields.month === minDate.getMonth() + 1
        ? minDate.getDate()
        : natural.min
    max =
      fields.year === maxDate?.getFullYear() && fields.month === maxDate.getMonth() + 1
        ? maxDate.getDate()
        : daysInMonth(fields.year, fields.month)
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
      fields.hour === minDate!.getHours() &&
      fields.minute === minDate!.getMinutes()
    const sameMaxMinute =
      !!maxDate &&
      sameDate(fields, maxDate) &&
      fields.hour === maxDate!.getHours() &&
      fields.minute === maxDate!.getMinutes()
    min = sameMinMinute ? minDate!.getSeconds() : natural.min
    max = sameMaxMinute ? maxDate!.getSeconds() : natural.max
  }

  return {
    max: Math.min(natural.max, max),
    min: Math.max(natural.min, min),
  }
}

function normalizeLimit(value: number | undefined, fallback: number, range: NumericRange): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(range.max, Math.max(range.min, Math.trunc(value as number)))
}

function isWithinLimit(value: number, range: NumericRange, limit: { min: number; max: number }) {
  if (limit.min <= limit.max) return value >= limit.min && value <= limit.max
  return value === limit.min
}

function createBaseOption(
  type: TemporalColumnType,
  value: number,
  disabled = false,
  timeSuffix = true,
): PickerOption {
  const text =
    type === 'year'
      ? `${value}年`
      : type === 'month'
        ? `${String(value).padStart(2, '0')}月`
        : type === 'day'
          ? `${String(value).padStart(2, '0')}日`
          : `${String(value).padStart(2, '0')}${timeSuffix ? ({ hour: '时', minute: '分', second: '秒' }[type] ?? '') : ''}`
  return disabled ? { disabled: true, text, value } : { text, value }
}

function resolveOptions(
  type: TemporalColumnType,
  fields: TemporalFields,
  selectedValues: readonly PickerValue[],
  config: TemporalColumnsConfig,
): PickerOption[] {
  const natural = NATURAL_RANGES[type]
  const dateRange = resolveDateRange(type, fields, config)
  const rawLimit = config.limits?.[type]
  const limit = rawLimit
    ? {
        max: normalizeLimit(rawLimit.max, natural.max, natural),
        min: normalizeLimit(rawLimit.min, natural.min, natural),
      }
    : null
  const start = config.minDate || config.maxDate ? dateRange.min : natural.min
  const end = config.minDate || config.maxDate ? dateRange.max : natural.max
  const options = Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => {
    const value = start + index
    const disabled = limit ? !isWithinLimit(value, natural, limit) : false
    return createBaseOption(type, value, disabled, config.timeSuffix ?? true)
  })
  const filtered = config.filter?.(type, options, fields, selectedValues) ?? options
  return filtered.map((option) => {
    const canonical = options.find((item) => Object.is(item.value, option.value))
    const formatted = config.formatter?.(type, option, fields) ?? option
    const next = {
      ...formatted,
      value: canonical?.value ?? option.value,
    }
    if (option.disabled !== undefined) next.disabled = option.disabled
    else if (formatted.disabled !== undefined) next.disabled = formatted.disabled
    return next
  })
}

export function createTemporalColumns(config: TemporalColumnsConfig): PickerColumns {
  return config.columnsType.map((type) => (context: PickerColumnContext) => {
    const fields = pickerValuesToTemporalFields(
      context.selectedValues,
      config.columnsType,
      DEFAULT_TEMPORAL_FIELDS,
    )
    return resolveOptions(type, fields, context.selectedValues, config)
  })
}
