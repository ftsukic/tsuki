import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  PickerChangeInfo,
  PickerColumnData,
  PickerColumnContext,
  PickerColumnSource,
  PickerColumns,
  PickerOption,
  PickerValue,
} from './types'

export interface ResolvedPickerColumn {
  items: PickerColumnData
  index: number
}

export interface ResolvedPickerState {
  columns: readonly ResolvedPickerColumn[]
  indexes: readonly number[]
  values: readonly PickerValue[]
  options: readonly PickerOption[]
}

function isColumnSource(value: unknown): value is PickerColumnSource {
  return Array.isArray(value) || typeof value === 'function'
}

function getColumnSources(columns: PickerColumns): readonly PickerColumnSource[] | null {
  if (columns.length === 0) return [columns as PickerColumnData]

  const first = columns[0]
  return isColumnSource(first) ? (columns as readonly PickerColumnSource[]) : null
}

function getIndex(items: PickerColumnData, requestedValue: PickerValue | undefined) {
  const requestedIndex = items.findIndex((item) => Object.is(item.value, requestedValue))
  return requestedIndex >= 0 ? requestedIndex : items.length > 0 ? 0 : -1
}

function makeContext(
  values: readonly PickerValue[],
  indexes: readonly number[],
  options: readonly PickerOption[],
): PickerColumnContext {
  return {
    selectedValues: values,
    selectedIndexes: indexes,
    selectedOptions: options,
    values,
    indexes,
  }
}

function resolveIndependentColumns(
  sources: readonly PickerColumnSource[],
  requestedValues: readonly PickerValue[],
): ResolvedPickerState {
  const columns: ResolvedPickerColumn[] = []
  const indexes: number[] = []
  const values: PickerValue[] = []
  const options: PickerOption[] = []

  sources.forEach((source, columnIndex) => {
    const context = makeContext(values, indexes, options)
    const items: PickerColumnData = typeof source === 'function' ? (source(context) ?? []) : source
    const index = getIndex(items, requestedValues[columnIndex])
    const option: PickerOption | undefined = index >= 0 ? items[index] : undefined

    columns.push({ items, index })
    indexes.push(index)
    if (option) {
      values.push(option.value)
      options.push(option)
    }
  })

  return { columns, indexes, values, options }
}

function resolveCascade(
  root: PickerColumnData,
  requestedValues: readonly PickerValue[],
): ResolvedPickerState {
  const columns: ResolvedPickerColumn[] = []
  const indexes: number[] = []
  const values: PickerValue[] = []
  const options: PickerOption[] = []
  let items: PickerColumnData | undefined = root
  let depth = 0

  while (items) {
    const index = getIndex(items, requestedValues[depth])
    const option: PickerOption | undefined = index >= 0 ? items[index] : undefined
    columns.push({ items, index })
    indexes.push(index)

    if (!option) break

    values.push(option.value)
    options.push(option)
    items = option.children
    depth += 1
  }

  return { columns, indexes, values, options }
}

export function resolvePickerState(
  columns: PickerColumns,
  requestedValues: readonly PickerValue[] = [],
): ResolvedPickerState {
  const sources = getColumnSources(columns)
  return sources
    ? resolveIndependentColumns(sources, requestedValues)
    : resolveCascade(columns as PickerColumnData, requestedValues)
}

export interface UsePickerResult extends ResolvedPickerState {
  select: (columnIndex: number, index: number) => void
}

interface UsePickerOptions {
  columns: PickerColumns
  value?: readonly PickerValue[]
  defaultValue?: readonly PickerValue[]
  onChange?: (
    values: readonly PickerValue[],
    options: readonly PickerOption[],
    info: PickerChangeInfo,
  ) => void
}

export function usePicker({
  columns,
  value,
  defaultValue,
  onChange,
}: UsePickerOptions): UsePickerResult {
  const isControlled = value !== undefined
  const [internalValues, setInternalValues] = useState<readonly PickerValue[]>(
    () => resolvePickerState(columns, defaultValue).values,
  )
  const requestedValues = isControlled ? value : internalValues
  const resolved = useMemo(
    () => resolvePickerState(columns, requestedValues),
    [columns, requestedValues],
  )
  const valuesRef = useRef(resolved.values)
  valuesRef.current = resolved.values
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (isControlled || areValuesEqual(internalValues, resolved.values)) return
    setInternalValues(resolved.values)
  }, [internalValues, isControlled, resolved.values])

  const select = useCallback(
    (columnIndex: number, index: number) => {
      const selectedColumn = resolved.columns[columnIndex]
      const option = selectedColumn?.items[index]
      if (!selectedColumn || !option) return

      const nextRequestedValues = [...valuesRef.current]
      nextRequestedValues[columnIndex] = option.value
      const next = resolvePickerState(columns, nextRequestedValues)
      if (!isControlled) setInternalValues(next.values)
      valuesRef.current = next.values
      onChangeRef.current?.(next.values, next.options, { columnIndex, index, option })
    },
    [columns, isControlled, resolved.columns],
  )

  return { ...resolved, select }
}

function areValuesEqual(left: readonly PickerValue[], right: readonly PickerValue[]) {
  return (
    left.length === right.length && left.every((value, index) => Object.is(value, right[index]))
  )
}
