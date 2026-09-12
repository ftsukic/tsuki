import { forwardRef, useMemo } from 'react'
import type { View } from 'react-native'
import { Picker } from '../picker'
import type { PickerOption, PickerValue } from '../picker/types'
import { padTimeValue, createTimePickerColumns } from './columns'
import type { TimePickerOption, TimePickerProps, TimePickerValue } from './types'

const DEFAULT_COLUMNS_TYPE = ['hour', 'minute'] as const

function toTimeOption(option: PickerOption): TimePickerOption {
  return { ...option, value: padTimeValue(Number(option.value)) }
}

function toPickerValue(value: string): PickerValue {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? Math.trunc(numericValue) : value
}

function toPickerValues(values: TimePickerValue | undefined): readonly PickerValue[] | undefined {
  return values?.map(toPickerValue)
}

function toTimeValue(value: PickerValue): string {
  return padTimeValue(Number(value))
}

function toTimeValues(values: readonly PickerValue[]): TimePickerValue {
  return values.map(toTimeValue)
}

export const TimePicker = forwardRef<View, TimePickerProps>(function TimePicker(
  {
    columnsType,
    minHour = 0,
    maxHour = 23,
    minMinute = 0,
    maxMinute = 59,
    minSecond = 0,
    maxSecond = 59,
    filter,
    formatter,
    value,
    defaultValue,
    onChange,
    onConfirm,
    ...pickerProps
  },
  ref,
) {
  const resolvedColumnsType = columnsType ?? DEFAULT_COLUMNS_TYPE
  const columns = useMemo(
    () =>
      createTimePickerColumns({
        columnsType: resolvedColumnsType,
        filter,
        formatter,
        maxHour,
        maxMinute,
        maxSecond,
        minHour,
        minMinute,
        minSecond,
      }),
    [
      filter,
      formatter,
      maxHour,
      maxMinute,
      maxSecond,
      minHour,
      minMinute,
      minSecond,
      resolvedColumnsType,
    ],
  )

  return (
    <Picker
      {...pickerProps}
      columns={columns}
      defaultValue={toPickerValues(defaultValue)}
      onChange={(values, options) => onChange?.(toTimeValues(values), options.map(toTimeOption))}
      onConfirm={(values, options) => onConfirm?.(toTimeValues(values), options.map(toTimeOption))}
      ref={ref}
      value={toPickerValues(value)}
    />
  )
})

TimePicker.displayName = 'TimePicker'
