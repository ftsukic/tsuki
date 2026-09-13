import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { Picker } from '../picker'
import type { PickerOption, PickerRef, PickerSelection, PickerValue } from '../picker/types'
import { createDateTimeColumns, normalizeDateTimePickerValues } from '../picker/date-time/columns'
import type { DateTimeColumnsConfig } from '../picker/date-time/columns'
import { normalizeDateTimeBounds, validateDateTimeColumnOrder } from '../picker/date-time/normalize'
import {
  dateToFields,
  fieldsToPickerValues,
  pickerValuesToFields,
  pickerValuesToSelectedValues,
  selectedValuesToPickerValues,
} from '../picker/date-time/value'
import type {
  DateTimePickerColumnType,
  DateTimePickerProps,
  DateTimePickerRef,
  DateTimePickerSelection,
} from './types'

const DEFAULT_COLUMNS = ['year', 'month', 'day', 'hour', 'minute'] as const
const EMPTY_SELECTION: DateTimePickerSelection = { indexes: [], options: [], values: [] }

export const DateTimePicker = forwardRef<DateTimePickerRef, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      defaultValue,
      columnsType = DEFAULT_COLUMNS,
      minDate,
      maxDate,
      hourStep,
      minuteStep,
      secondStep,
      formatter,
      filter,
      cancelText = '取消',
      confirmText = '确定',
      onChange,
      onConfirm,
      onCancel,
      ...props
    },
    ref,
  ) {
    const resolvedColumns = useMemo(() => validateDateTimeColumnOrder(columnsType), [columnsType])
    const referenceDateRef = useRef(new Date())
    const bounds = useMemo(
      () => normalizeDateTimeBounds(minDate, maxDate, referenceDateRef.current),
      [maxDate, minDate],
    )
    const initialDate = useMemo(() => {
      const timestamp = Math.min(
        bounds.maxDate.getTime(),
        Math.max(bounds.minDate.getTime(), referenceDateRef.current.getTime()),
      )
      return new Date(timestamp)
    }, [bounds.maxDate, bounds.minDate])
    const baseFields = useMemo(
      () =>
        pickerValuesToFields(
          selectedValuesToPickerValues(value ?? defaultValue ?? [], resolvedColumns),
          resolvedColumns,
          dateToFields(initialDate),
        ),
      [defaultValue, initialDate, resolvedColumns, value],
    )
    const columnConfig = useMemo<DateTimeColumnsConfig>(
      () => ({
        baseFields,
        columnsType: resolvedColumns,
        filter: filter
          ? (type, options, values) => filter(type as DateTimePickerColumnType, options, values)
          : undefined,
        formatter: formatter
          ? (type, option) => formatter(type as DateTimePickerColumnType, option)
          : undefined,
        hourStep,
        maxDate: bounds.maxDate,
        minDate: bounds.minDate,
        minuteStep,
        secondStep,
      }),
      [
        baseFields,
        bounds.maxDate,
        bounds.minDate,
        filter,
        formatter,
        hourStep,
        minuteStep,
        resolvedColumns,
        secondStep,
      ],
    )
    const columns = useMemo(() => createDateTimeColumns(columnConfig), [columnConfig])
    const pickerRef = useRef<PickerRef>(null)
    const pickerValue = useMemo(
      () =>
        value === undefined
          ? undefined
          : normalizeDateTimePickerValues(
              selectedValuesToPickerValues(value, resolvedColumns),
              columnConfig,
            ),
      [columnConfig, resolvedColumns, value],
    )
    const pickerDefaultValue = useMemo(
      () =>
        value !== undefined
          ? undefined
          : normalizeDateTimePickerValues(
              defaultValue === undefined
                ? fieldsToPickerValues(baseFields, resolvedColumns)
                : selectedValuesToPickerValues(defaultValue, resolvedColumns),
              columnConfig,
            ),
      [baseFields, columnConfig, defaultValue, resolvedColumns, value],
    )
    const handleChange = useCallback(
      (nextValues: readonly PickerValue[], options: readonly PickerOption[]) => {
        onChange?.(pickerValuesToSelectedValues(nextValues, resolvedColumns, baseFields), options)
      },
      [baseFields, onChange, resolvedColumns],
    )
    const handleConfirm = useCallback(
      (nextValues: readonly PickerValue[], options: readonly PickerOption[]) => {
        onConfirm?.(pickerValuesToSelectedValues(nextValues, resolvedColumns, baseFields), options)
      },
      [baseFields, onConfirm, resolvedColumns],
    )
    const getSelectedValues = useCallback(
      () =>
        pickerValuesToSelectedValues(
          pickerRef.current?.getSelectedValues() ?? [],
          resolvedColumns,
          baseFields,
        ),
      [baseFields, resolvedColumns],
    )
    const confirm = useCallback((): DateTimePickerSelection => {
      const selection: PickerSelection | undefined = pickerRef.current?.confirm()
      if (!selection) return EMPTY_SELECTION
      return {
        indexes: selection.indexes,
        options: selection.options,
        values: pickerValuesToSelectedValues(selection.values, resolvedColumns, baseFields),
      }
    }, [baseFields, resolvedColumns])
    useImperativeHandle(
      ref,
      () => ({
        cancel: () => pickerRef.current?.cancel(),
        confirm,
        getSelectedOptions: () => pickerRef.current?.getSelectedOptions() ?? [],
        getSelectedValues,
      }),
      [confirm, getSelectedValues],
    )

    return (
      <Picker
        {...props}
        columns={columns}
        defaultValue={pickerDefaultValue}
        onCancel={onCancel}
        onChange={handleChange}
        onConfirm={handleConfirm}
        ref={pickerRef}
        value={pickerValue}
        cancelButtonText={cancelText}
        confirmButtonText={confirmText}
      />
    )
  },
)

DateTimePicker.displayName = 'DateTimePicker'
