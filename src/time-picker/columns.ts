import { createDateTimeColumns } from '../picker/date-time/columns'
import type { PickerColumns, PickerOption } from '../picker/types'
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

export function padTimeValue(value: number): string {
  return String(Math.trunc(value)).padStart(2, '0')
}

export function createTimeOptions(min: number, max: number): TimePickerOption[] {
  const start = Number.isFinite(min) ? Math.trunc(min) : 0
  const end = Math.max(start, Number.isFinite(max) ? Math.trunc(max) : start)
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const value = padTimeValue(start + index)
    return { text: value, value }
  })
}

function toTimeOption(option: PickerOption): TimePickerOption {
  return { ...option, value: padTimeValue(Number(option.value)) }
}

function toPickerOption(option: TimePickerOption): PickerOption {
  const value = Number(option.value)
  return { ...option, value: Number.isFinite(value) ? value : option.value }
}

export function createTimePickerColumns(config: TimePickerColumnsConfig): PickerColumns {
  const columnsType = config.columnsType ?? DEFAULT_COLUMNS_TYPE
  const columns = createDateTimeColumns({
    columnsType,
    filter: config.filter
      ? (type, options, _fields, selectedValues) =>
          config.filter!(
            type as TimePickerColumnType,
            options.map(toTimeOption),
            selectedValues.map((value) => padTimeValue(Number(value))),
          ).map(toPickerOption)
      : undefined,
    formatter: config.formatter
      ? (type, option) => {
          const formatted = config.formatter!(type as TimePickerColumnType, toTimeOption(option))
          return { ...formatted, value: option.value }
        }
      : undefined,
    limits: {
      hour: { max: config.maxHour, min: config.minHour },
      minute: { max: config.maxMinute, min: config.minMinute },
      second: { max: config.maxSecond, min: config.minSecond },
    },
    timeSuffix: false,
  })
  return columns
}

export type { TimePickerFilter, TimePickerFormatter, TimePickerValue }
