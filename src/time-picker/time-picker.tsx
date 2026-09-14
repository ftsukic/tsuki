import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Picker } from '../picker'
import {
  PickerGroupProvider,
  usePickerGroup,
  usePickerGroupRegistrationContext,
} from '../picker-group/context'
import type { PickerOption, PickerRef, PickerSelection, PickerValue } from '../picker/types'
import { createDateTimeColumns, normalizeDateTimePickerValues } from '../picker/date-time/columns'
import type { DateTimeColumnsConfig } from '../picker/date-time/columns'
import { normalizeColumnTypes, timeColumnTypes } from '../picker/date-time/normalize'
import {
  DEFAULT_DATE_TIME_FIELDS,
  pickerValuesToFields,
  pickerValuesToSelectedValues,
  selectedValuesToPickerValues,
} from '../picker/date-time/value'
import type {
  TimePickerColumnType,
  TimePickerProps,
  TimePickerRef,
  TimePickerSelection,
} from './types'

const DEFAULT_COLUMNS = ['hour', 'minute'] as const
const EMPTY_SELECTION: TimePickerSelection = { indexes: [], options: [], values: [] }

export const TimePicker = forwardRef<TimePickerRef, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue,
    columnsType = DEFAULT_COLUMNS,
    minHour,
    maxHour,
    minMinute,
    maxMinute,
    minSecond,
    maxSecond,
    minTime,
    maxTime,
    hourStep,
    minuteStep,
    secondStep,
    formatter,
    filter,
    cancelButtonText = '取消',
    confirmButtonText = '确定',
    onChange,
    onConfirm,
    onCancel,
    ...props
  },
  ref,
) {
  const resolvedColumns = useMemo(
    () => normalizeColumnTypes(columnsType, timeColumnTypes(), 'TimePicker'),
    [columnsType],
  )
  const baseFields = useMemo(
    () =>
      pickerValuesToFields(
        selectedValuesToPickerValues(value ?? defaultValue ?? [], resolvedColumns),
        resolvedColumns,
        DEFAULT_DATE_TIME_FIELDS,
      ),
    [defaultValue, resolvedColumns, value],
  )
  const columnConfig = useMemo<DateTimeColumnsConfig>(
    () => ({
      baseFields,
      columnsType: resolvedColumns,
      filter: filter
        ? (type, options, values) => filter(type as TimePickerColumnType, options, values)
        : undefined,
      formatter: formatter
        ? (type, option) => formatter(type as TimePickerColumnType, option)
        : undefined,
      hourStep,
      maxHour,
      maxMinute,
      maxSecond,
      maxTime,
      minHour,
      minMinute,
      minSecond,
      minTime,
      minuteStep,
      secondStep,
    }),
    [
      baseFields,
      filter,
      formatter,
      hourStep,
      maxHour,
      maxMinute,
      maxSecond,
      maxTime,
      minHour,
      minMinute,
      minSecond,
      minTime,
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
      defaultValue === undefined
        ? undefined
        : normalizeDateTimePickerValues(
            selectedValuesToPickerValues(defaultValue, resolvedColumns),
            columnConfig,
          ),
    [columnConfig, defaultValue, resolvedColumns],
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
  const confirm = useCallback((): TimePickerSelection => {
    const selection: PickerSelection | undefined = pickerRef.current?.confirm()
    if (!selection) return EMPTY_SELECTION
    return {
      indexes: selection.indexes,
      options: selection.options,
      values: pickerValuesToSelectedValues(selection.values, resolvedColumns, baseFields),
    }
  }, [baseFields, resolvedColumns])
  const group = usePickerGroup()
  const registrationContext = usePickerGroupRegistrationContext()
  const confirmRef = useRef(confirm)
  confirmRef.current = confirm
  const getSelectedValuesRef = useRef(getSelectedValues)
  getSelectedValuesRef.current = getSelectedValues
  const publicRef = useMemo<TimePickerRef>(
    () => ({
      cancel: () => pickerRef.current?.cancel(),
      confirm: () => confirmRef.current(),
      getSelectedOptions: () => pickerRef.current?.getSelectedOptions() ?? [],
      getSelectedValues: () => getSelectedValuesRef.current(),
    }),
    [],
  )
  useImperativeHandle(ref, () => publicRef, [publicRef])
  useEffect(() => {
    if (!group) return
    group.register(group.index, publicRef)
    return () => group.register(group.index, null)
  }, [group, group?.index, publicRef])

  return (
    <PickerGroupProvider value={registrationContext}>
      <Picker
        {...props}
        columns={columns}
        defaultValue={pickerDefaultValue}
        onCancel={onCancel}
        onChange={handleChange}
        onConfirm={handleConfirm}
        ref={pickerRef}
        value={pickerValue}
        cancelButtonText={cancelButtonText}
        confirmButtonText={confirmButtonText}
      />
    </PickerGroupProvider>
  )
})

TimePicker.displayName = 'TimePicker'
