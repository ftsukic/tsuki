import { forwardRef, useCallback, useMemo } from 'react'
import { TemporalPickerCore, useTemporalPickerCore } from '../temporal-picker/temporal-picker-core'
import { dateToTemporalFields, temporalFieldsToDate } from '../temporal-picker/value'
import type { PickerValue } from '../picker/types'
import type { TemporalFields, TemporalFormatter } from '../temporal-picker/types'
import type { DateTimePickerCoreProps, DateTimePickerCoreRef } from './date-time-picker.types'

export interface DateTimePickerCoreState {
  selectedDate: Date
  values: readonly number[]
}

const COLUMNS_TYPE = ['year', 'month', 'day', 'hour', 'minute', 'second'] as const

export function useDateTimePickerCore({
  value,
  minDate,
  maxDate,
  formatter,
  onChange,
}: Pick<DateTimePickerCoreProps, 'value' | 'minDate' | 'maxDate' | 'formatter' | 'onChange'>) {
  const temporalFormatter = useMemo<TemporalFormatter | undefined>(
    () =>
      formatter
        ? (type, option) => ({
            ...option,
            text: formatter(type, Number(option.value)),
          })
        : undefined,
    [formatter],
  )
  const core = useTemporalPickerCore({
    columnsType: COLUMNS_TYPE,
    formatter: temporalFormatter,
    maxDate,
    minDate,
    onChange: (fields) => onChange?.(temporalFieldsToDate(fields)),
    value: dateToTemporalFields(value),
  })
  const resolveValues = useCallback(
    (values: readonly PickerValue[]) => temporalFieldsToDate(core.resolveValues(values)),
    [core],
  )
  return {
    columns: core.columns,
    getValues: core.getValues,
    handleChange: core.handleChange,
    resolveValues,
    selectedDate: temporalFieldsToDate(core.fields),
    values: core.values,
  }
}

export const DateTimePickerCore = forwardRef<DateTimePickerCoreRef, DateTimePickerCoreProps>(
  function DateTimePickerCore(
    { value, minDate, maxDate, formatter, onChange, onConfirm, ...pickerProps },
    ref,
  ) {
    const temporalFormatter = useMemo<TemporalFormatter | undefined>(
      () =>
        formatter
          ? (type, option) => ({
              ...option,
              text: formatter(type, Number(option.value)),
            })
          : undefined,
      [formatter],
    )
    const handleChange = useCallback(
      (fields: TemporalFields) => onChange?.(temporalFieldsToDate(fields)),
      [onChange],
    )
    const handleConfirm = useCallback(
      (fields: TemporalFields) => onConfirm?.(temporalFieldsToDate(fields)),
      [onConfirm],
    )
    return (
      <TemporalPickerCore
        {...pickerProps}
        columnsType={COLUMNS_TYPE}
        formatter={temporalFormatter}
        maxDate={maxDate}
        minDate={minDate}
        onChange={handleChange}
        onConfirm={handleConfirm}
        ref={ref}
        value={dateToTemporalFields(value)}
      />
    )
  },
)

DateTimePickerCore.displayName = 'DateTimePickerCore'
