import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Picker } from '../picker'
import { createDateTimeColumns } from '../picker/date-time/columns'
import type { DateTimeColumnFormatter } from '../picker/date-time/types'
import type { PickerValue } from '../picker/types'
import {
  clampDate,
  createDateFromPickerValues,
  getDatePickerColumnTypes,
  getDatePickerValues,
  normalizeDateRange,
  startOfDate,
} from './utils'
import type { DatePickerColumnType, DatePickerProps, DatePickerRef } from './types'

export const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue,
    minDate,
    maxDate,
    type = 'date',
    title,
    cancelText = '取消',
    confirmText = '确定',
    formatter,
    visible,
    onVisibleChange,
    onChange,
    onConfirm,
    onCancel,
    testID,
    ...pickerProps
  },
  ref,
) {
  const initialReferenceRef = useRef<Date | undefined>(undefined)
  if (!initialReferenceRef.current) {
    initialReferenceRef.current = startOfDate(value ?? defaultValue ?? new Date())
  }

  const dateRange = useMemo(() => normalizeDateRange(minDate, maxDate), [maxDate, minDate])
  const initialDate = clampDate(
    value ?? defaultValue ?? initialReferenceRef.current ?? new Date(),
    dateRange.minDate,
    dateRange.maxDate,
  )
  const [committedDate, setCommittedDate] = useState(initialDate)
  const [draftDate, setDraftDate] = useState(initialDate)
  const [internalVisible, setInternalVisible] = useState(false)
  const draftDateRef = useRef(draftDate)
  const previousVisibleRef = useRef(visible ?? false)
  const previousValueTimestampRef = useRef(value?.getTime())

  const isVisibleControlled = visible !== undefined
  const isVisible = visible ?? internalVisible
  const valueTimestamp = value?.getTime()
  const resolvedValue = clampDate(value ?? committedDate, dateRange.minDate, dateRange.maxDate)
  const resolvedValueTimestamp = resolvedValue.getTime()
  const columnsType = useMemo(() => getDatePickerColumnTypes(type), [type])
  const columnFormatter = useMemo<DateTimeColumnFormatter | undefined>(
    () =>
      formatter
        ? (columnType, option) => ({
            ...option,
            text: formatter(columnType as DatePickerColumnType, Number(option.value)),
          })
        : undefined,
    [formatter],
  )
  const columns = useMemo(
    () =>
      createDateTimeColumns({
        columnsType,
        formatter: columnFormatter,
        maxDate: dateRange.maxDate,
        minDate: dateRange.minDate,
      }),
    [columnFormatter, columnsType, dateRange.maxDate, dateRange.minDate],
  )

  useEffect(() => {
    const nextValueTimestamp = value?.getTime()
    const previousValueTimestamp = previousValueTimestampRef.current
    previousValueTimestampRef.current = nextValueTimestamp
    if (value === undefined || nextValueTimestamp === previousValueTimestamp) return

    const nextValue = clampDate(value, dateRange.minDate, dateRange.maxDate)
    draftDateRef.current = nextValue
    setCommittedDate(nextValue)
    setDraftDate(nextValue)
  }, [dateRange.maxDate, dateRange.minDate, value, valueTimestamp])

  useEffect(() => {
    const nextCommittedDate = clampDate(
      value ?? committedDate,
      dateRange.minDate,
      dateRange.maxDate,
    )

    if (nextCommittedDate.getTime() !== committedDate.getTime()) {
      setCommittedDate(nextCommittedDate)
    }
    if (!isVisible && draftDate.getTime() !== nextCommittedDate.getTime()) {
      draftDateRef.current = nextCommittedDate
      setDraftDate(nextCommittedDate)
    }
  }, [
    committedDate,
    dateRange.maxDate,
    dateRange.minDate,
    draftDate,
    isVisible,
    value,
    valueTimestamp,
  ])

  useEffect(() => {
    if (isVisible && previousVisibleRef.current !== true) {
      draftDateRef.current = resolvedValue
      setDraftDate(resolvedValue)
    }
    previousVisibleRef.current = isVisible
  }, [isVisible, resolvedValue, resolvedValueTimestamp])

  const open = useCallback(() => {
    draftDateRef.current = resolvedValue
    setDraftDate(resolvedValue)
    if (!isVisibleControlled) setInternalVisible(true)
    onVisibleChange?.(true)
  }, [isVisibleControlled, onVisibleChange, resolvedValue])

  const close = useCallback(() => {
    if (!isVisibleControlled) setInternalVisible(false)
    onVisibleChange?.(false)
  }, [isVisibleControlled, onVisibleChange])

  const handleChange = useCallback(
    (nextDate: Date) => {
      draftDateRef.current = nextDate
      setDraftDate(nextDate)
      onChange?.(nextDate)
    },
    [onChange],
  )

  const handleConfirm = useCallback(
    (nextDate: Date) => {
      const normalizedDate = clampDate(nextDate, dateRange.minDate, dateRange.maxDate)
      draftDateRef.current = normalizedDate
      setDraftDate(normalizedDate)
      if (value === undefined) setCommittedDate(normalizedDate)
      onConfirm?.(normalizedDate)
      close()
    },
    [close, dateRange.maxDate, dateRange.minDate, onConfirm, value],
  )

  const handlePickerChange = useCallback(
    (values: readonly PickerValue[]) =>
      handleChange(
        createDateFromPickerValues(
          values,
          draftDateRef.current,
          type,
          dateRange.minDate,
          dateRange.maxDate,
        ),
      ),
    [dateRange.maxDate, dateRange.minDate, handleChange, type],
  )

  const handlePickerConfirm = useCallback(
    (values: readonly PickerValue[]) =>
      handleConfirm(
        createDateFromPickerValues(
          values,
          draftDateRef.current,
          type,
          dateRange.minDate,
          dateRange.maxDate,
        ),
      ),
    [dateRange.maxDate, dateRange.minDate, handleConfirm, type],
  )

  const handleCancel = useCallback(() => {
    draftDateRef.current = resolvedValue
    setDraftDate(resolvedValue)
    onCancel?.()
    close()
  }, [close, onCancel, resolvedValue])

  const confirm = useCallback(() => {
    if (!isVisible) return
    handleConfirm(draftDateRef.current)
  }, [handleConfirm, isVisible])

  useImperativeHandle(ref, () => ({ close, confirm, open }), [close, confirm, open])

  return (
    <Picker
      {...pickerProps}
      cancelButtonText={cancelText}
      columns={columns}
      confirmButtonText={confirmText}
      onCancel={handleCancel}
      onChange={handlePickerChange}
      onConfirm={handlePickerConfirm}
      testID={testID ?? 'date-picker'}
      title={title}
      value={getDatePickerValues(draftDate, type)}
      visible={isVisible}
    />
  )
})

DatePicker.displayName = 'DatePicker'
