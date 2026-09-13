import type {
  PickerColumnData,
  PickerColumnContext,
  PickerColumnSource,
  PickerColumns,
  PickerOption,
  PickerValue,
} from './types'

export const DEFAULT_DURATION = 200
export const MOMENTUM_TIME = 300
export const MOMENTUM_DISTANCE = 15
export const MOMENTUM_DECELERATION = 0.003

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
  if (columns.length === 0) return []
  return isColumnSource(columns[0]) ? (columns as readonly PickerColumnSource[]) : null
}

export function findEnabledIndex(items: PickerColumnData, index: number): number {
  if (items.length === 0) return -1
  const target = Math.min(items.length - 1, Math.max(0, Math.trunc(index) || 0))
  for (let i = target; i < items.length; i += 1) {
    if (!items[i].disabled) return i
  }
  for (let i = target - 1; i >= 0; i -= 1) {
    if (!items[i].disabled) return i
  }
  return -1
}

export function findEnabledIndexWorklet(enabledFlags: readonly boolean[], index: number): number {
  'worklet'
  if (enabledFlags.length === 0) return -1
  const target = Math.min(enabledFlags.length - 1, Math.max(0, Math.trunc(index) || 0))
  for (let i = target; i < enabledFlags.length; i += 1) if (enabledFlags[i]) return i
  for (let i = target - 1; i >= 0; i -= 1) if (enabledFlags[i]) return i
  return -1
}

export function getOffsetByIndex(index: number, optionHeight: number) {
  'worklet'
  return -index * optionHeight
}

export function getIndexByOffset(offset: number, optionHeight: number, count: number) {
  'worklet'
  if (count <= 0 || optionHeight <= 0) return -1
  return Math.min(count - 1, Math.max(0, Math.round(-offset / optionHeight)))
}

export function getMomentumTarget({
  offset,
  momentumOffset,
  duration,
}: {
  offset: number
  momentumOffset: number
  duration: number
}) {
  'worklet'
  const distance = offset - momentumOffset
  if (duration >= MOMENTUM_TIME || Math.abs(distance) <= MOMENTUM_DISTANCE) return null
  const speed = Math.abs(distance / duration)
  return offset + (speed / MOMENTUM_DECELERATION) * (distance < 0 ? -1 : 1)
}

export function arePickerValuesEqual(left: readonly PickerValue[], right: readonly PickerValue[]) {
  return (
    left.length === right.length && left.every((value, index) => Object.is(value, right[index]))
  )
}

function makeContext(
  values: readonly PickerValue[],
  indexes: readonly number[],
  options: readonly PickerOption[],
  requestedValues: readonly PickerValue[],
): PickerColumnContext {
  return {
    selectedValues: values,
    selectedIndexes: indexes,
    selectedOptions: options,
    values,
    indexes,
    requestedValues,
  }
}

function resolveIndex(
  items: PickerColumnData,
  requestedValue: PickerValue | undefined,
  previousIndex?: number,
  previousValue?: PickerValue,
) {
  const requestedIndex = items.findIndex((item) => Object.is(item.value, requestedValue))
  const previousInvalid =
    previousValue !== undefined && !items.some((item) => Object.is(item.value, previousValue))
  const requested = requestedIndex >= 0 && !items[requestedIndex].disabled
  const requestedNumber = Number(requestedValue)
  const nearestIndex = Number.isFinite(requestedNumber)
    ? items.reduce<number | undefined>((nearest, item, index) => {
        if (item.disabled || !Number.isFinite(Number(item.value))) return nearest
        if (nearest === undefined) return index
        return Math.abs(Number(item.value) - requestedNumber) <
          Math.abs(Number(items[nearest].value) - requestedNumber)
          ? index
          : nearest
      }, undefined)
    : undefined
  const index = requested
    ? requestedIndex
    : (nearestIndex ??
      findEnabledIndex(items, Number.isFinite(previousIndex) ? (previousIndex as number) : 0))
  return {
    index,
    requestedIndex,
    reconciled:
      !requested ||
      previousInvalid ||
      (previousValue !== undefined && requested && previousIndex !== requestedIndex),
  }
}

export function resolvePickerColumns(
  columns: PickerColumns,
  requestedValues: readonly PickerValue[] = [],
  previousState?: Pick<ResolvedPickerState, 'indexes' | 'values'>,
): readonly ResolvedPickerColumn[] {
  const sources = getColumnSources(columns)
  if (sources) {
    const result: ResolvedPickerColumn[] = []
    const indexes: number[] = []
    const values: PickerValue[] = []
    const options: PickerOption[] = []
    sources.forEach((source, columnIndex) => {
      const items =
        typeof source === 'function'
          ? (source(makeContext(values, indexes, options, requestedValues)) ?? [])
          : source
      const resolved = resolveIndex(
        items,
        requestedValues[columnIndex],
        previousState?.indexes[columnIndex],
        previousState?.values[columnIndex],
      )
      result.push({ items, ...resolved })
      indexes.push(resolved.index)
      if (resolved.index >= 0) {
        values.push(items[resolved.index].value)
        options.push(items[resolved.index])
      }
    })
    return result
  }

  const result: ResolvedPickerColumn[] = []
  let items: PickerColumnData | undefined = columns as PickerColumnData
  let depth = 0
  while (items) {
    const resolved = resolveIndex(
      items,
      requestedValues[depth],
      previousState?.indexes[depth],
      previousState?.values[depth],
    )
    result.push({ items, ...resolved })
    const option: PickerOption | undefined = resolved.index >= 0 ? items[resolved.index] : undefined
    items = option?.children
    depth += 1
  }
  return result
}

export function resolvePickerState(
  columns: PickerColumns,
  requestedValues: readonly PickerValue[] = [],
  previousState?: Pick<ResolvedPickerState, 'indexes' | 'values'>,
): ResolvedPickerState {
  const resolvedColumns = resolvePickerColumns(columns, requestedValues, previousState)
  const indexes = resolvedColumns.map((column) => column.index)
  const options = resolvedColumns.flatMap((column) =>
    column.index >= 0 ? [column.items[column.index]] : [],
  )
  return {
    columns: resolvedColumns,
    indexes,
    options,
    values: options.map((option) => option.value),
  }
}
