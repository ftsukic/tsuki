import { forwardRef, useCallback, useMemo } from 'react'
import type { View } from 'react-native'
import { TemporalPickerCore } from '../temporal-picker/temporal-picker-core'
import {
  DEFAULT_TEMPORAL_FIELDS,
  pickerValuesToTemporalFields,
  temporalFieldsToPickerValues,
} from '../temporal-picker/value'
import type { PickerOption } from '../picker/types'
import type { TemporalFields, TemporalFilter, TemporalFormatter } from '../temporal-picker/types'
import { padTimeValue } from './columns'
import type {
  TimePickerColumnType,
  TimePickerOption,
  TimePickerProps,
  TimePickerValue,
} from './types'

const DEFAULT_COLUMNS_TYPE = ['hour', 'minute'] as const

function toTimeOption(option: PickerOption): TimePickerOption {
  return { ...option, value: padTimeValue(Number(option.value)) }
}

function toTimeValue(value: number): string {
  return padTimeValue(value)
}

function toTimeValues(values: readonly number[]): TimePickerValue {
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
  const temporalValue = useMemo(
    () =>
      value
        ? pickerValuesToTemporalFields(value, resolvedColumnsType, DEFAULT_TEMPORAL_FIELDS)
        : undefined,
    [resolvedColumnsType, value],
  )
  const temporalDefaultValue = useMemo(
    () =>
      defaultValue
        ? pickerValuesToTemporalFields(defaultValue, resolvedColumnsType, DEFAULT_TEMPORAL_FIELDS)
        : undefined,
    [defaultValue, resolvedColumnsType],
  )
  const temporalFormatter = useMemo<TemporalFormatter | undefined>(
    () =>
      formatter
        ? (type, option) => {
            const formatted = formatter(type as TimePickerColumnType, toTimeOption(option))
            return { ...formatted, value: option.value }
          }
        : undefined,
    [formatter],
  )
  const temporalFilter = useMemo<TemporalFilter | undefined>(
    () =>
      filter
        ? (type, options, _fields, selectedValues) =>
            filter(
              type as TimePickerColumnType,
              options.map(toTimeOption),
              selectedValues.map((selectedValue) => toTimeValue(Number(selectedValue))),
            ).map((option) => {
              const numericValue = Number(option.value)
              return {
                ...option,
                value: Number.isFinite(numericValue) ? numericValue : option.value,
              }
            })
        : undefined,
    [filter],
  )
  const limits = useMemo(
    () => ({
      hour: { max: maxHour, min: minHour },
      minute: { max: maxMinute, min: minMinute },
      second: { max: maxSecond, min: minSecond },
    }),
    [maxHour, maxMinute, maxSecond, minHour, minMinute, minSecond],
  )
  const handleChange = useCallback(
    (fields: TemporalFields, options: readonly PickerOption[]) =>
      onChange?.(
        toTimeValues(temporalFieldsToPickerValues(fields, resolvedColumnsType)),
        options.map(toTimeOption),
      ),
    [onChange, resolvedColumnsType],
  )
  const handleConfirm = useCallback(
    (fields: TemporalFields, options: readonly PickerOption[]) =>
      onConfirm?.(
        toTimeValues(temporalFieldsToPickerValues(fields, resolvedColumnsType)),
        options.map(toTimeOption),
      ),
    [onConfirm, resolvedColumnsType],
  )

  return (
    <TemporalPickerCore
      {...pickerProps}
      columnsType={resolvedColumnsType}
      defaultValue={temporalDefaultValue}
      fallback={DEFAULT_TEMPORAL_FIELDS}
      filter={temporalFilter}
      formatter={temporalFormatter}
      limits={limits}
      onChange={handleChange}
      onConfirm={handleConfirm}
      pickerRef={ref}
      timeSuffix={false}
      value={temporalValue}
    />
  )
})

TimePicker.displayName = 'TimePicker'
