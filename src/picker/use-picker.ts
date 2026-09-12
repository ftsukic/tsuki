import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  requestedIndex: number
  reconciled: boolean
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

export function findNearestEnabledIndex(items: PickerColumnData, index: number): number {
  if (items.length === 0) return -1
  const normalized = Math.min(
    items.length - 1,
    Math.max(0, Math.trunc(Number.isFinite(index) ? index : 0)),
  )
  if (!items[normalized]?.disabled) return normalized
  for (let distance = 1; distance < items.length; distance += 1) {
    const lower = normalized - distance
    if (lower >= 0 && !items[lower].disabled) return lower
    const upper = normalized + distance
    if (upper < items.length && !items[upper].disabled) return upper
  }
  return -1
}

function getIndex(
  items: PickerColumnData,
  requestedValue: PickerValue | undefined,
  previousIndex?: number,
  previousValue?: PickerValue,
) {
  const requestedIndex = items.findIndex((item) => Object.is(item.value, requestedValue))
  const previousValueInvalidated =
    previousValue !== undefined && !items.some((item) => Object.is(item.value, previousValue))
  const indexRebased =
    previousValue !== undefined &&
    previousIndex !== undefined &&
    requestedIndex >= 0 &&
    Object.is(previousValue, items[requestedIndex].value) &&
    previousIndex !== requestedIndex
  if (requestedIndex >= 0 && !items[requestedIndex].disabled) {
    return {
      index: requestedIndex,
      requestedIndex,
      reconciled: previousValueInvalidated || indexRebased,
    }
  }
  if (items.length === 0) return { index: -1, requestedIndex, reconciled: true }

  const resolvedFallbackIndex = Number.isFinite(previousIndex)
    ? Math.trunc(previousIndex as number)
    : 0
  return {
    index: findNearestEnabledIndex(items, resolvedFallbackIndex),
    requestedIndex,
    reconciled: true,
  }
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
  previousState?: Pick<ResolvedPickerState, 'indexes' | 'values'>,
): ResolvedPickerState {
  const columns: ResolvedPickerColumn[] = []
  const indexes: number[] = []
  const values: PickerValue[] = []
  const options: PickerOption[] = []

  sources.forEach((source, columnIndex) => {
    const context = makeContext(values, indexes, options)
    const items: PickerColumnData = typeof source === 'function' ? (source(context) ?? []) : source
    const resolvedIndex = getIndex(
      items,
      requestedValues[columnIndex],
      previousState?.indexes?.[columnIndex],
      previousState?.values?.[columnIndex],
    )
    const { index } = resolvedIndex
    const option: PickerOption | undefined = index >= 0 ? items[index] : undefined

    columns.push({ items, ...resolvedIndex })
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
  previousState?: Pick<ResolvedPickerState, 'indexes' | 'values'>,
): ResolvedPickerState {
  const columns: ResolvedPickerColumn[] = []
  const indexes: number[] = []
  const values: PickerValue[] = []
  const options: PickerOption[] = []
  let items: PickerColumnData | undefined = root
  let depth = 0

  while (items) {
    const resolvedIndex = getIndex(
      items,
      requestedValues[depth],
      previousState?.indexes?.[depth],
      previousState?.values?.[depth],
    )
    const { index } = resolvedIndex
    const option: PickerOption | undefined = index >= 0 ? items[index] : undefined
    columns.push({ items, ...resolvedIndex })
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
  previousState?: Pick<ResolvedPickerState, 'indexes' | 'values'>,
): ResolvedPickerState {
  const sources = getColumnSources(columns)
  return sources
    ? resolveIndependentColumns(sources, requestedValues, previousState)
    : resolveCascade(columns as PickerColumnData, requestedValues, previousState)
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
  const previousResolvedRef = useRef<ResolvedPickerState | undefined>(undefined)
  const resolved = useMemo(
    () => resolvePickerState(columns, requestedValues, previousResolvedRef.current),
    [columns, requestedValues],
  )
  useLayoutEffect(() => {
    previousResolvedRef.current = resolved
  }, [resolved])
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
      if (!selectedColumn || !option || option.disabled) return

      const nextRequestedValues = [...valuesRef.current]
      nextRequestedValues[columnIndex] = option.value
      const next = resolvePickerState(columns, nextRequestedValues, resolved)
      if (!isControlled) setInternalValues(next.values)
      valuesRef.current = next.values
      onChangeRef.current?.(next.values, next.options, { columnIndex, index, option })
    },
    [columns, isControlled, resolved],
  )

  return { ...resolved, select }
}

function areValuesEqual(left: readonly PickerValue[], right: readonly PickerValue[]) {
  return (
    left.length === right.length && left.every((value, index) => Object.is(value, right[index]))
  )
}
