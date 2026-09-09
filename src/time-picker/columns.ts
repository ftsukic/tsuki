import type { PickerColumnContext, PickerColumns } from '../picker/types'
import type {
  TimePickerColumnType,
  TimePickerFilter,
  TimePickerFormatter,
  TimePickerOption,
  TimePickerProps,
  TimePickerValue,
} from './types'

const DEFAULT_COLUMNS_TYPE: readonly TimePickerColumnType[] = ['hour', 'minute']

type TimePickerColumnsConfig = Pick<
  TimePickerProps,
  | 'columnsType'
  | 'minHour'
  | 'maxHour'
  | 'minMinute'
  | 'maxMinute'
  | 'minSecond'
  | 'maxSecond'
  | 'filter'
  | 'formatter'
>

interface TimeRange {
  min: number
  max: number
}

const TIME_RANGES: Record<TimePickerColumnType, TimeRange> = {
  hour: { min: 0, max: 23 },
  minute: { min: 0, max: 59 },
  second: { min: 0, max: 59 },
}

export function padTimeValue(value: number): string {
  return String(Math.trunc(value)).padStart(2, '0')
}

export function createTimeOptions(min: number, max: number): TimePickerOption[] {
  const start = Number.isFinite(min) ? Math.trunc(min) : 0
  const requestedEnd = Number.isFinite(max) ? Math.trunc(max) : start
  const end = Math.max(start, requestedEnd)

  return Array.from({ length: end - start + 1 }, (_, index) => {
    const value = padTimeValue(start + index)
    return { text: value, value }
  })
}

function normalizeTimeBound(value: number | undefined, fallback: number, range: TimeRange): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(range.max, Math.max(range.min, Math.trunc(value as number)))
}

function resolveTimeRange(type: TimePickerColumnType, config: TimePickerColumnsConfig): TimeRange {
  const range = TIME_RANGES[type]
  const minValue =
    type === 'hour' ? config.minHour : type === 'minute' ? config.minMinute : config.minSecond
  const maxValue =
    type === 'hour' ? config.maxHour : type === 'minute' ? config.maxMinute : config.maxSecond
  const min = normalizeTimeBound(minValue, range.min, range)
  const normalizedMax = normalizeTimeBound(maxValue, range.max, range)

  return { min, max: min > normalizedMax ? min : normalizedMax }
}

function getResolvedValues(context: PickerColumnContext): TimePickerValue {
  return context.selectedValues.map((value) => String(value))
}

function applyOptionTransforms(
  type: TimePickerColumnType,
  options: readonly TimePickerOption[],
  values: TimePickerValue,
  filter: TimePickerFilter | undefined,
  formatter: TimePickerFormatter | undefined,
): TimePickerOption[] {
  const filteredOptions = filter?.(type, options, values) ?? options

  return filteredOptions.map((option) => {
    const formatted = formatter?.(type, option) ?? option
    return {
      ...option,
      ...formatted,
      value: option.value,
    }
  })
}

export function createTimePickerColumns(config: TimePickerColumnsConfig): PickerColumns {
  const columnTypes = config.columnsType ?? DEFAULT_COLUMNS_TYPE

  return columnTypes.map((type) => (context: PickerColumnContext) => {
    const range = resolveTimeRange(type, config)
    const options = createTimeOptions(range.min, range.max)

    return applyOptionTransforms(
      type,
      options,
      getResolvedValues(context),
      config.filter,
      config.formatter,
    )
  })
}
