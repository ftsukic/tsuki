import {
  forwardRef,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Picker } from '../picker'
import type { View } from 'react-native'
import type { PickerColumns, PickerOption, PickerProps, PickerValue } from '../picker/types'
import { createTemporalColumns } from './columns'
import {
  DEFAULT_TEMPORAL_FIELDS,
  dateToTemporalFields,
  pickerValuesToTemporalFields,
  temporalFieldsKey,
  temporalFieldsToDate,
  temporalFieldsToPickerValues,
} from './value'
import type {
  TemporalColumnType,
  TemporalFields,
  TemporalFilter,
  TemporalFormatter,
  TemporalLimits,
} from './types'

export interface TemporalPickerCoreRef {
  confirm(): void
}

export interface TemporalPickerCoreProps extends Omit<
  PickerProps,
  'columns' | 'value' | 'defaultValue' | 'onChange' | 'onConfirm'
> {
  columnsType: readonly TemporalColumnType[]
  value?: TemporalFields
  defaultValue?: TemporalFields
  fallback?: TemporalFields
  minDate?: Date
  maxDate?: Date
  limits?: TemporalLimits
  filter?: TemporalFilter
  formatter?: TemporalFormatter
  timeSuffix?: boolean
  onChange?(value: TemporalFields, options: readonly PickerOption[]): void
  onConfirm?(value: TemporalFields, options: readonly PickerOption[]): void
  pickerRef?: Ref<View>
}

export interface UseTemporalPickerCoreOptions {
  columnsType: readonly TemporalColumnType[]
  value?: TemporalFields
  defaultValue?: TemporalFields
  fallback?: TemporalFields
  minDate?: Date
  maxDate?: Date
  limits?: TemporalLimits
  filter?: TemporalFilter
  formatter?: TemporalFormatter
  timeSuffix?: boolean
  onChange?(value: TemporalFields, options: readonly PickerOption[]): void
}

function normalizeFields(fields: TemporalFields): TemporalFields {
  const next = { ...DEFAULT_TEMPORAL_FIELDS, ...fields }
  const year = Number.isFinite(next.year) ? Math.trunc(next.year) : DEFAULT_TEMPORAL_FIELDS.year
  const month = Number.isFinite(next.month)
    ? Math.max(1, Math.min(12, Math.trunc(next.month)))
    : DEFAULT_TEMPORAL_FIELDS.month
  const day = Number.isFinite(next.day)
    ? Math.max(1, Math.min(new Date(year, month, 0).getDate(), Math.trunc(next.day)))
    : DEFAULT_TEMPORAL_FIELDS.day
  const date = new Date(
    year,
    month - 1,
    day,
    Math.max(0, Math.min(23, next.hour)),
    Math.max(0, Math.min(59, next.minute)),
    Math.max(0, Math.min(59, next.second)),
  )
  return dateToTemporalFields(date)
}

export function reconcileTemporalFields(
  fields: TemporalFields,
  minDate?: Date,
  maxDate?: Date,
): TemporalFields {
  const normalized = normalizeFields(fields)
  const date = temporalFieldsToDate(normalized)
  if (minDate && date.getTime() < minDate.getTime()) return dateToTemporalFields(minDate)
  if (maxDate && date.getTime() > maxDate.getTime()) return dateToTemporalFields(maxDate)
  return normalized
}

export function useTemporalPickerCore({
  columnsType,
  value,
  defaultValue,
  fallback = DEFAULT_TEMPORAL_FIELDS,
  minDate,
  maxDate,
  limits,
  filter,
  formatter,
  timeSuffix,
  onChange,
}: UseTemporalPickerCoreOptions) {
  const initial = reconcileTemporalFields(value ?? defaultValue ?? fallback, minDate, maxDate)
  const [fields, setFields] = useState<TemporalFields>(initial)
  const fieldsRef = useRef(fields)
  const committedFieldsRef = useRef(fields)
  const externalKey = value
    ? temporalFieldsKey(reconcileTemporalFields(value, minDate, maxDate))
    : null
  const previousExternalKeyRef = useRef(externalKey)
  fieldsRef.current = fields

  useEffect(() => {
    if (!value || externalKey === previousExternalKeyRef.current) return
    const next = reconcileTemporalFields(value, minDate, maxDate)
    previousExternalKeyRef.current = externalKey
    fieldsRef.current = next
    committedFieldsRef.current = next
    setFields(next)
  }, [externalKey, maxDate, minDate, value])

  const resolveValues = useCallback(
    (values: readonly PickerValue[]) =>
      reconcileTemporalFields(
        pickerValuesToTemporalFields(values, columnsType, fieldsRef.current),
        minDate,
        maxDate,
      ),
    [columnsType, maxDate, minDate],
  )
  const handleChange = useCallback(
    (values: readonly PickerValue[], options: readonly PickerOption[]) => {
      const next = resolveValues(values)
      fieldsRef.current = next
      setFields(next)
      onChange?.(next, options)
    },
    [onChange, resolveValues],
  )
  const commit = useCallback((next: TemporalFields, options: readonly PickerOption[] = []) => {
    committedFieldsRef.current = next
    fieldsRef.current = next
    setFields(next)
    return options
  }, [])
  const columns: PickerColumns = useMemo(
    () =>
      createTemporalColumns({
        columnsType,
        filter,
        formatter,
        limits,
        maxDate,
        minDate,
        timeSuffix,
      }),
    [columnsType, filter, formatter, limits, maxDate, minDate, timeSuffix],
  )

  return {
    columns,
    fields,
    fieldsRef,
    committedFieldsRef,
    handleChange,
    commit,
    resolveValues,
    values: temporalFieldsToPickerValues(fields, columnsType),
    getValues: () => temporalFieldsToPickerValues(fieldsRef.current, columnsType),
  }
}

export const TemporalPickerCore = forwardRef<TemporalPickerCoreRef, TemporalPickerCoreProps>(
  function TemporalPickerCore(
    {
      columnsType,
      value,
      defaultValue,
      fallback,
      minDate,
      maxDate,
      limits,
      filter,
      formatter,
      timeSuffix,
      onChange,
      onConfirm,
      onCancel,
      pickerRef,
      ...pickerProps
    },
    ref,
  ) {
    const core = useTemporalPickerCore({
      columnsType,
      defaultValue,
      fallback,
      filter,
      formatter,
      maxDate,
      minDate,
      onChange,
      value,
      limits,
      timeSuffix,
    })
    const confirm = useCallback(() => {
      const next = core.resolveValues(core.getValues())
      core.commit(next)
      onConfirm?.(next, [])
    }, [core, onConfirm])
    const handleConfirm = useCallback(
      (values: readonly PickerValue[], options: readonly PickerOption[]) => {
        const next = core.resolveValues(values)
        core.commit(next, options)
        onConfirm?.(next, options)
      },
      [core, onConfirm],
    )
    const handleCancel = useCallback(() => {
      const next = core.committedFieldsRef.current
      core.fieldsRef.current = next
      core.commit(next)
      onCancel?.()
    }, [core, onCancel])

    useImperativeHandle(ref, () => ({ confirm }), [confirm])

    return (
      <Picker
        {...pickerProps}
        columns={core.columns}
        onCancel={handleCancel}
        onChange={core.handleChange}
        onConfirm={handleConfirm}
        ref={pickerRef}
        value={core.values}
      />
    )
  },
)

TemporalPickerCore.displayName = 'TemporalPickerCore'
