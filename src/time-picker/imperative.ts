import { closePicker, showPicker } from '../picker/imperative'
import type { PickerOptions, PickerOption, PickerValue } from '../picker/types'
import { createTimePickerColumns, padTimeValue } from './columns'
import type {
  TimePickerOption,
  TimePickerOptions,
  TimePickerResult,
  TimePickerValue,
} from './types'

function toPickerValue(value: string): PickerValue {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? Math.trunc(numericValue) : value
}

function toPickerValues(values: TimePickerValue | undefined): readonly PickerValue[] | undefined {
  return values?.map(toPickerValue)
}

function toTimeOption(option: PickerOption): TimePickerOption {
  const value = Number(option.value)
  return { ...option, value: Number.isFinite(value) ? padTimeValue(value) : String(option.value) }
}

function toTimeValues(values: readonly PickerValue[]): TimePickerValue {
  return values.map((value) => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? padTimeValue(numericValue) : String(value)
  })
}

function toPickerOptions(options: TimePickerOptions): PickerOptions {
  const {
    columnsType,
    minHour,
    maxHour,
    minMinute,
    maxMinute,
    minSecond,
    maxSecond,
    filter,
    formatter,
    value,
    defaultValue,
    onChange,
    onConfirm,
    ...pickerProps
  } = options

  return {
    ...pickerProps,
    columns: createTimePickerColumns({
      columnsType,
      filter,
      formatter,
      maxHour,
      maxMinute,
      maxSecond,
      minHour,
      minMinute,
      minSecond,
    }),
    defaultValue: toPickerValues(defaultValue),
    onChange: onChange
      ? (values: readonly PickerValue[], selectedOptions: readonly PickerOption[]) =>
          onChange(toTimeValues(values), selectedOptions.map(toTimeOption))
      : undefined,
    onConfirm: onConfirm
      ? (values: readonly PickerValue[], selectedOptions: readonly PickerOption[]) =>
          onConfirm(toTimeValues(values), selectedOptions.map(toTimeOption))
      : undefined,
    value: toPickerValues(value),
  }
}

export function showTimePicker(options: TimePickerOptions): Promise<TimePickerResult> {
  return showPicker(toPickerOptions(options)).then((result) => ({
    action: result.action,
    options: result.options.map(toTimeOption),
    values: toTimeValues(result.values),
  }))
}

export function closeTimePicker(): void {
  closePicker()
}
