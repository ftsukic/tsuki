import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { Picker } from '../picker'
import type { PickerOption, PickerRef, PickerSelection, PickerValue } from '../picker/types'
import { createDateTimeColumns, normalizeDateTimePickerValues } from '../picker/date-time/columns'
import type { DateTimeColumnsConfig } from '../picker/date-time/columns'
import { normalizeColumnTypes, normalizeDatePickerBounds } from '../picker/date-time/normalize'
import {
  dateToFields,
  fieldsToPickerValues,
  pickerValuesToFields,
  pickerValuesToSelectedValues,
  selectedValuesToPickerValues,
} from '../picker/date-time/value'
import type {
  DatePickerColumnType,
  DatePickerProps,
  DatePickerRef,
  DatePickerSelection,
} from './types'

const DEFAULT_COLUMNS = ['year', 'month', 'day'] as const
const COLUMN_TYPES = DEFAULT_COLUMNS
const EMPTY_SELECTION: DatePickerSelection = { indexes: [], options: [], values: [] }

export const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue,
    columnsType = DEFAULT_COLUMNS,
    minDate,
    maxDate,
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
  const resolvedColumns = useMemo(
    () => normalizeColumnTypes(columnsType, COLUMN_TYPES, 'DatePicker'),
    [columnsType],
  )
  const referenceDateRef = useRef(new Date())
  const bounds = useMemo(
    () => normalizeDatePickerBounds(minDate, maxDate, referenceDateRef.current),
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
        ? (type, options, values) => filter(type as DatePickerColumnType, options, values)
        : undefined,
      formatter: formatter
        ? (type, option) => formatter(type as DatePickerColumnType, option)
        : undefined,
      maxDate: bounds.maxDate,
      minDate: bounds.minDate,
    }),
    [baseFields, bounds.maxDate, bounds.minDate, filter, formatter, resolvedColumns],
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
  const confirm = useCallback((): DatePickerSelection => {
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
})

DatePicker.displayName = 'DatePicker'
