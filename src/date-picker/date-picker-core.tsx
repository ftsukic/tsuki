import { forwardRef, useCallback, useMemo } from 'react'
import { TemporalPickerCore, useTemporalPickerCore } from '../temporal-picker/temporal-picker-core'
import { dateToTemporalFields, temporalFieldsToDate } from '../temporal-picker/value'
import type { PickerValue } from '../picker/types'
import type { DatePickerColumnType } from './date-picker.types'
import type { TemporalFields, TemporalFormatter } from '../temporal-picker/types'
import { getDatePickerColumnTypes } from './date-picker.utils'
import type { DatePickerCoreProps, DatePickerCoreRef } from './date-picker.types'

export interface DatePickerCoreState {
  selectedDate: Date
  values: readonly number[]
}

export function useDatePickerCore({
  value,
  minDate,
  maxDate,
  type = 'date',
  formatter,
  onChange,
}: Pick<
  DatePickerCoreProps,
  'value' | 'minDate' | 'maxDate' | 'type' | 'formatter' | 'onChange'
>): DatePickerCoreState & {
  columns: ReturnType<typeof useTemporalPickerCore>['columns']
  handleChange(values: readonly PickerValue[]): void
  getValues(): readonly number[]
  resolveValues(values: readonly PickerValue[]): Date
} {
  const columnsType = useMemo(() => getDatePickerColumnTypes(type), [type])
  const temporalFormatter = useMemo<TemporalFormatter | undefined>(
    () =>
      formatter
        ? (columnType, option) => ({
            ...option,
            text: formatter(columnType as DatePickerColumnType, Number(option.value)),
          })
        : undefined,
    [formatter],
  )
  const core = useTemporalPickerCore({
    columnsType,
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
    handleChange: (values) => core.handleChange(values, []),
    resolveValues,
    selectedDate: temporalFieldsToDate(core.fields),
    values: core.values,
  }
}

export const DatePickerCore = forwardRef<DatePickerCoreRef, DatePickerCoreProps>(
  function DatePickerCore(
    { value, minDate, maxDate, type = 'date', formatter, onChange, onConfirm, ...pickerProps },
    ref,
  ) {
    const columnsType = useMemo(() => getDatePickerColumnTypes(type), [type])
    const temporalFormatter = useMemo<TemporalFormatter | undefined>(
      () =>
        formatter
          ? (columnType, option) => ({
              ...option,
              text: formatter(columnType as DatePickerColumnType, Number(option.value)),
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
        columnsType={columnsType}
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

DatePickerCore.displayName = 'DatePickerCore'
