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
  clampDateTime,
  createDateTimeFromPickerValues,
  getDateTimePickerColumnTypes,
  getDateTimePickerValues,
  normalizeDateTimeRange,
} from './utils'
import type { DateTimePickerColumnType, DateTimePickerProps, DateTimePickerRef } from './types'

export const DateTimePicker = forwardRef<DateTimePickerRef, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      defaultValue,
      minDate,
      maxDate,
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
    const range = useMemo(() => normalizeDateTimeRange(minDate, maxDate), [maxDate, minDate])
    const initial = clampDateTime(value ?? defaultValue ?? new Date(), range.minDate, range.maxDate)
    const [committedDate, setCommittedDate] = useState(initial)
    const [draftDate, setDraftDate] = useState(initial)
    const [internalVisible, setInternalVisible] = useState(false)
    const draftDateRef = useRef(draftDate)
    const previousVisibleRef = useRef(visible ?? false)
    const previousValueRef = useRef(value?.getTime())
    const controlledVisible = visible !== undefined
    const isVisible = visible ?? internalVisible
    const valueTimestamp = value?.getTime()
    const resolved = clampDateTime(value ?? committedDate, range.minDate, range.maxDate)
    const resolvedTimestamp = resolved.getTime()
    const columnsType = useMemo(() => getDateTimePickerColumnTypes(), [])
    const columnFormatter = useMemo<DateTimeColumnFormatter | undefined>(
      () =>
        formatter
          ? (columnType, option) => ({
              ...option,
              text: formatter(columnType as DateTimePickerColumnType, Number(option.value)),
            })
          : undefined,
      [formatter],
    )
    const columns = useMemo(
      () =>
        createDateTimeColumns({
          columnsType,
          formatter: columnFormatter,
          maxDate: range.maxDate,
          minDate: range.minDate,
        }),
      [columnFormatter, columnsType, range.maxDate, range.minDate],
    )

    useEffect(() => {
      const next = value?.getTime()
      const previous = previousValueRef.current
      previousValueRef.current = next
      if (value === undefined || next === previous) return
      const normalized = clampDateTime(value, range.minDate, range.maxDate)
      draftDateRef.current = normalized
      setCommittedDate(normalized)
      setDraftDate(normalized)
    }, [range.maxDate, range.minDate, value, valueTimestamp])

    useEffect(() => {
      const next = clampDateTime(value ?? committedDate, range.minDate, range.maxDate)
      if (next.getTime() !== committedDate.getTime()) setCommittedDate(next)
      if (!isVisible && draftDate.getTime() !== next.getTime()) {
        draftDateRef.current = next
        setDraftDate(next)
      }
    }, [committedDate, draftDate, isVisible, range.maxDate, range.minDate, value, valueTimestamp])

    useEffect(() => {
      if (isVisible && previousVisibleRef.current !== true) {
        draftDateRef.current = resolved
        setDraftDate(resolved)
      }
      previousVisibleRef.current = isVisible
    }, [isVisible, resolved, resolvedTimestamp])

    const open = useCallback(() => {
      draftDateRef.current = resolved
      setDraftDate(resolved)
      if (!controlledVisible) setInternalVisible(true)
      onVisibleChange?.(true)
    }, [controlledVisible, onVisibleChange, resolved])

    const close = useCallback(() => {
      if (!controlledVisible) setInternalVisible(false)
      onVisibleChange?.(false)
    }, [controlledVisible, onVisibleChange])

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
        const normalized = clampDateTime(nextDate, range.minDate, range.maxDate)
        draftDateRef.current = normalized
        setDraftDate(normalized)
        if (value === undefined) setCommittedDate(normalized)
        onConfirm?.(normalized)
        close()
      },
      [close, onConfirm, range.maxDate, range.minDate, value],
    )

    const handlePickerChange = useCallback(
      (values: readonly PickerValue[]) =>
        handleChange(
          createDateTimeFromPickerValues(
            values,
            draftDateRef.current,
            range.minDate,
            range.maxDate,
          ),
        ),
      [handleChange, range.maxDate, range.minDate],
    )

    const handlePickerConfirm = useCallback(
      (values: readonly PickerValue[]) =>
        handleConfirm(
          createDateTimeFromPickerValues(
            values,
            draftDateRef.current,
            range.minDate,
            range.maxDate,
          ),
        ),
      [handleConfirm, range.maxDate, range.minDate],
    )

    const handleCancel = useCallback(() => {
      draftDateRef.current = resolved
      setDraftDate(resolved)
      onCancel?.()
      close()
    }, [close, onCancel, resolved])

    const confirm = useCallback(() => {
      if (isVisible) handleConfirm(draftDateRef.current)
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
        testID={testID ?? 'date-time-picker'}
        title={title}
        value={getDateTimePickerValues(draftDate)}
        visible={isVisible}
      />
    )
  },
)

DateTimePicker.displayName = 'DateTimePicker'
