import type {
  PickerColumnData,
  PickerColumnContext,
  PickerColumnSource,
  PickerColumns,
  PickerOption,
  PickerValue,
} from './types'
import { MOTION_DURATION } from '../motion/token'
import { dateTimeColumns } from './date-time/columns'

export const DEFAULT_DURATION = MOTION_DURATION.normal
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

interface NumericOptionIndex {
  value: number
  index: number
}

interface PickerColumnIndex {
  /** `null` means every item is enabled, avoiding a large worklet capture. */
  enabledFlags: boolean[] | null
  indexByValue: Map<PickerValue | symbol, number>
  nextEnabledIndex?: number[]
  numericOptions?: NumericOptionIndex[]
  previousEnabledIndex?: number[]
}

const negativeZero = Symbol('picker-negative-zero')
// Picker columns are readonly inputs. Replace the array and changed option objects
// when updating data so this identity cache cannot retain stale indexes.
const pickerColumnIndexes = new WeakMap<PickerColumnData, PickerColumnIndex>()

function getValueKey(value: PickerValue | undefined): PickerValue | symbol {
  return typeof value === 'number' && Object.is(value, -0) ? negativeZero : (value as PickerValue)
}

function getPickerColumnIndex(items: PickerColumnData): PickerColumnIndex {
  const cached = pickerColumnIndexes.get(items)
  if (cached) return cached

  let enabledFlags: boolean[] | null = null
  const indexByValue = new Map<PickerValue | symbol, number>()

  items.forEach((item, index) => {
    if (item.disabled) {
      if (enabledFlags === null) {
        enabledFlags = new Array<boolean>(items.length).fill(true)
      }
      enabledFlags[index] = false
    } else if (enabledFlags !== null) {
      enabledFlags[index] = true
    }
    const key = getValueKey(item.value)
    if (!indexByValue.has(key)) indexByValue.set(key, index)
  })

  let nextEnabledIndex: number[] | undefined
  let previousEnabledIndex: number[] | undefined
  if (enabledFlags !== null) {
    nextEnabledIndex = new Array<number>(items.length)
    previousEnabledIndex = new Array<number>(items.length)
    let nearestEnabled = -1
    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (enabledFlags[index]) nearestEnabled = index
      nextEnabledIndex[index] = nearestEnabled
    }
    nearestEnabled = -1
    for (let index = 0; index < items.length; index += 1) {
      if (enabledFlags[index]) nearestEnabled = index
      previousEnabledIndex[index] = nearestEnabled
    }
  }

  const result = {
    enabledFlags,
    indexByValue,
    nextEnabledIndex,
    previousEnabledIndex,
  }
  pickerColumnIndexes.set(items, result)
  return result
}

export function getPickerEnabledFlags(items: PickerColumnData): readonly boolean[] | null {
  return getPickerColumnIndex(items).enabledFlags
}

function getNumericOptions(items: PickerColumnData, indexed: PickerColumnIndex) {
  if (indexed.numericOptions) return indexed.numericOptions

  const numericOptions: NumericOptionIndex[] = []
  let numericOptionsSorted = true
  let previousNumericValue = -Infinity
  items.forEach((item, index) => {
    if (item.disabled) return
    const value = Number(item.value)
    if (!Number.isFinite(value)) return
    if (value < previousNumericValue) numericOptionsSorted = false
    previousNumericValue = value
    numericOptions.push({ index, value })
  })

  if (!numericOptionsSorted) {
    numericOptions.sort((left, right) => left.value - right.value || left.index - right.index)
  }

  // Keep the first enabled item for each numeric value, matching Array.reduce's
  // stable tie behavior while allowing nearest-value lookup with binary search.
  let uniqueLength = 0
  numericOptions.forEach((option) => {
    if (uniqueLength === 0 || option.value !== numericOptions[uniqueLength - 1].value) {
      numericOptions[uniqueLength] = option
      uniqueLength += 1
    }
  })
  numericOptions.length = uniqueLength
  indexed.numericOptions = numericOptions
  return numericOptions
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
  const indexed = getPickerColumnIndex(items)
  if (indexed.enabledFlags === null) return target
  const nextEnabledIndex = indexed.nextEnabledIndex!
  const previousEnabledIndex = indexed.previousEnabledIndex!
  return nextEnabledIndex[target] >= 0 ? nextEnabledIndex[target] : previousEnabledIndex[target]
}

export function findEnabledIndexWorklet(
  enabledFlags: readonly boolean[] | null,
  index: number,
  count: number,
): number {
  'worklet'
  if (count === 0) return -1
  const target = Math.min(count - 1, Math.max(0, Math.trunc(index) || 0))
  if (enabledFlags === null) return target
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
  if (items.length === 0) {
    return { index: -1, requestedIndex: -1, reconciled: true }
  }

  const indexed = getPickerColumnIndex(items)
  const requestedIndex = indexed.indexByValue.get(getValueKey(requestedValue)) ?? -1
  const previousInvalid =
    previousValue !== undefined && !indexed.indexByValue.has(getValueKey(previousValue))
  const requested = requestedIndex >= 0 && !items[requestedIndex].disabled
  const requestedNumber = Number(requestedValue)
  let nearestIndex: number | undefined
  const numericOptions =
    !requested && Number.isFinite(requestedNumber) ? getNumericOptions(items, indexed) : []
  if (numericOptions.length > 0) {
    let low = 0
    let high = numericOptions.length
    while (low < high) {
      const middle = (low + high) >>> 1
      if (numericOptions[middle].value < requestedNumber) low = middle + 1
      else high = middle
    }

    const lower = numericOptions[low - 1]
    const upper = numericOptions[low]
    if (!lower) nearestIndex = upper.index
    else if (!upper) nearestIndex = lower.index
    else {
      const lowerDistance = Math.abs(lower.value - requestedNumber)
      const upperDistance = Math.abs(upper.value - requestedNumber)
      nearestIndex =
        lowerDistance < upperDistance
          ? lower.index
          : upperDistance < lowerDistance
            ? upper.index
            : Math.min(lower.index, upper.index)
    }
  }
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
    const positional = dateTimeColumns.has(columns)
    if (positional && previousState && requestedValues.length < sources.length) {
      let valueIndex = 0
      requestedValues = previousState.indexes.map((index) =>
        index >= 0 ? requestedValues[valueIndex++] : Number.NaN,
      )
    }
    const result: ResolvedPickerColumn[] = []
    const indexes: number[] = []
    const values: PickerValue[] = []
    const options: PickerOption[] = []
    let previousValueIndex = 0
    sources.forEach((source, columnIndex) => {
      const items =
        typeof source === 'function'
          ? (source(makeContext(values, indexes, options, requestedValues)) ?? [])
          : source
      const resolved = resolveIndex(
        items,
        requestedValues[positional ? columnIndex : values.length],
        previousState?.indexes[columnIndex],
        previousState?.values[previousValueIndex],
      )
      result.push({ items, ...resolved })
      indexes.push(resolved.index)
      if (resolved.index >= 0) {
        values.push(items[resolved.index].value)
        options.push(items[resolved.index])
      }
      if (previousState && previousState.indexes[columnIndex] >= 0) previousValueIndex += 1
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
