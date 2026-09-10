import { useCallback, useMemo, useRef } from 'react'
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

interface ImagePreviewPagingOptions {
  count: number
  initialIndex: number
  viewportWidth: number
  loop: boolean
  onIndexChange: (index: number) => void
}

function normalizeIndex(index: number, count: number, loop: boolean) {
  if (count <= 0) return 0
  const value = Math.trunc(index)
  if (!loop) return Math.min(count - 1, Math.max(0, value))
  return ((value % count) + count) % count
}

export function useImagePreviewPaging({
  count,
  initialIndex,
  viewportWidth,
  loop,
  onIndexChange,
}: ImagePreviewPagingOptions) {
  const listRef = useRef<FlatList<number> | null>(null)
  const activeIndexRef = useRef(normalizeIndex(initialIndex, count, loop))
  const resolvedLoop = loop && count > 1
  const dataLength = resolvedLoop ? count + 2 : count
  const normalizedInitialIndex = useMemo(
    () => normalizeIndex(initialIndex, count, loop),
    [count, initialIndex, loop],
  )
  const data = useMemo(() => Array.from({ length: dataLength }, (_, index) => index), [dataLength])
  const toPhysicalIndex = useCallback(
    (index: number) => (resolvedLoop ? normalizeIndex(index, count, false) + 1 : index),
    [count, resolvedLoop],
  )
  const getLogicalIndex = useCallback(
    (physicalIndex: number) => {
      if (!resolvedLoop) return normalizeIndex(physicalIndex, count, false)
      if (physicalIndex <= 0) return count - 1
      if (physicalIndex >= count + 1) return 0
      return physicalIndex - 1
    },
    [count, resolvedLoop],
  )
  const itemLayout = useCallback(
    (_data: ArrayLike<number> | null | undefined, index: number) => ({
      index,
      length: viewportWidth,
      offset: viewportWidth * index,
    }),
    [viewportWidth],
  )

  const publishIndex = useCallback(
    (nextIndex: number) => {
      const next = normalizeIndex(nextIndex, count, loop)
      if (next === activeIndexRef.current) return
      activeIndexRef.current = next
      onIndexChange(next)
    },
    [count, loop, onIndexChange],
  )

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset?.x ?? 0
      const physicalIndex = Math.min(
        Math.max(0, Math.round(offset / Math.max(1, viewportWidth))),
        Math.max(0, dataLength - 1),
      )
      const logicalIndex = getLogicalIndex(physicalIndex)
      if (resolvedLoop && physicalIndex === 0) {
        listRef.current?.scrollToIndex({ animated: false, index: count })
      } else if (resolvedLoop && physicalIndex === count + 1) {
        listRef.current?.scrollToIndex({ animated: false, index: 1 })
      }
      publishIndex(logicalIndex)
    },
    [count, dataLength, getLogicalIndex, publishIndex, resolvedLoop, viewportWidth],
  )

  const scrollToIndex = useCallback(
    (index: number, immediate = false) => {
      const target = normalizeIndex(index, count, loop)
      const physicalTarget = toPhysicalIndex(target)
      try {
        listRef.current?.scrollToIndex({ animated: !immediate, index: physicalTarget })
      } catch {
        listRef.current?.scrollToOffset({
          animated: !immediate,
          offset: physicalTarget * viewportWidth,
        })
      }
      if (immediate) publishIndex(target)
    },
    [count, loop, publishIndex, toPhysicalIndex, viewportWidth],
  )

  const reset = useCallback(
    (index: number) => {
      const target = normalizeIndex(index, count, loop)
      activeIndexRef.current = target
      listRef.current?.scrollToIndex({ animated: false, index: toPhysicalIndex(target) })
      onIndexChange(target)
    },
    [count, loop, onIndexChange, toPhysicalIndex],
  )

  const onScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      listRef.current?.scrollToOffset({
        animated: false,
        offset: info.index * viewportWidth,
      })
    },
    [viewportWidth],
  )

  const keyExtractor = useCallback((item: number) => String(item), [])

  return {
    activeIndexRef,
    data,
    dataLength,
    getLogicalIndex,
    getItemLayout: itemLayout,
    initialScrollIndex: count > 0 ? toPhysicalIndex(normalizedInitialIndex) : undefined,
    keyExtractor,
    listRef,
    onMomentumScrollEnd,
    onScrollToIndexFailed,
    reset,
    scrollToIndex,
  }
}
