import { closePicker, showPicker } from '../picker/imperative'
import type { PickerOptions, PickerOption, PickerValue } from '../picker/types'
import { createTimePickerColumns } from './columns'
import type {
  TimePickerOption,
  TimePickerOptions,
  TimePickerResult,
  TimePickerValue,
} from './types'

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
    defaultValue,
    onChange: onChange
      ? (values: readonly PickerValue[], selectedOptions: readonly PickerOption[]) =>
          onChange(values as TimePickerValue, selectedOptions as readonly TimePickerOption[])
      : undefined,
    onConfirm: onConfirm
      ? (values: readonly PickerValue[], selectedOptions: readonly PickerOption[]) =>
          onConfirm(values as TimePickerValue, selectedOptions as readonly TimePickerOption[])
      : undefined,
    value,
  }
}

export function showTimePicker(options: TimePickerOptions): Promise<TimePickerResult> {
  return showPicker(toPickerOptions(options)).then((result) => ({
    action: result.action,
    options: result.options as readonly TimePickerOption[],
    values: result.values as TimePickerValue,
  }))
}

export function closeTimePicker(): void {
  closePicker()
}
