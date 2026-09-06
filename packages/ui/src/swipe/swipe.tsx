import { usePersistFn } from '../hooks'
import { useToken } from '../theme'
import type { SwipePaginationProps, SwipeProps, SwipeRef } from './interface'
import { createSwipeStyles } from './style'
import {
  Children,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  AppState,
  ScrollView,
  View,
  type AppStateStatus,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'

interface SwipeLayout {
  height: number
  width: number
}

interface PageDescriptor {
  clone: boolean
  key: string
  logicalIndex: number
}

const MOMENTUM_END_FALLBACK_DELAY = 120
const PROGRAMMATIC_SCROLL_FALLBACK_DELAY = 1000

function clampIndex(index: number, count: number) {
  if (count <= 0 || !Number.isFinite(index)) return 0
  return Math.min(Math.max(Math.trunc(index), 0), count - 1)
}

function isAppActive(status: AppStateStatus | null | undefined) {
  return status !== 'background' && status !== 'inactive'
}

function InternalSwipe(
  {
    accessibilityLabel = 'Swipe',
    afterChange,
    autoplay = false,
    autoplayInterval = 3000,
    children,
    dotActiveStyle,
    dots = true,
    dotStyle,
    infinite = false,
    lazy = false,
    nestedScrollEnabled = true,
    onLayout,
    onMomentumScrollEnd,
    onScroll,
    onScrollAnimationEnd,
    onScrollBeginDrag,
    onScrollEndDrag,
    pageStyle,
    pagination,
    renderLazyPlaceholder,
    scrollEnabled = true,
    scrollEventThrottle = 16,
    selectedIndex,
    showsHorizontalScrollIndicator = false,
    showsVerticalScrollIndicator = false,
    style,
    testID,
    theme,
    vertical = false,
    ...scrollViewProps
  }: SwipeProps,
  ref: React.ForwardedRef<SwipeRef>,
) {
  const items = useMemo(() => Children.toArray(children), [children])
  const count = items.length
  const initialIndex = clampIndex(selectedIndex ?? 0, count)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [layout, setLayout] = useState<SwipeLayout>({ height: 0, width: 0 })
  const [appActive, setAppActive] = useState(() => isAppActive(AppState.currentState))
  const [interacting, setInteracting] = useState(false)
  const currentIndexRef = useRef(initialIndex)
  const draggingRef = useRef(false)
  const interactingRef = useRef(false)
  const latestAxisOffsetRef = useRef(0)
  const momentumEndFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingScrollRef = useRef(false)
  const previousCountRef = useRef(count)
  const previousSelectedIndexRef = useRef(selectedIndex)
  const protectedPhysicalIndexRef = useRef<number | null>(null)
  const settleAtOffsetRef = useRef<(offset: number) => void>(() => undefined)
  const scrollViewRef = useRef<ScrollView>(null)
  const { components } = useToken()
  const token = useMemo(() => ({ ...components.Swipe, ...theme }), [components.Swipe, theme])
  const styles = useMemo(() => createSwipeStyles(token), [token])
  const emitAfterChange = usePersistFn((index: number) => afterChange?.(index))
  const emitScrollAnimationEnd = usePersistFn(() => onScrollAnimationEnd?.())
  const emitLayout = usePersistFn((event: LayoutChangeEvent) => onLayout?.(event))

  const hasInfiniteClones = infinite && count > 1
  const pageSize = vertical ? layout.height : layout.width

  const toPhysicalIndex = useCallback(
    (logicalIndex: number) => logicalIndex + (hasInfiniteClones ? 1 : 0),
    [hasInfiniteClones],
  )

  const scrollToPhysicalIndex = useCallback(
    (physicalIndex: number, animated: boolean) => {
      if (pageSize <= 0 || count === 0) return
      scrollViewRef.current?.scrollTo({
        x: vertical ? 0 : physicalIndex * pageSize,
        y: vertical ? physicalIndex * pageSize : 0,
        animated,
      })
    },
    [count, pageSize, vertical],
  )

  const setLogicalIndex = useCallback(
    (nextIndex: number, notify: boolean) => {
      const normalizedIndex = clampIndex(nextIndex, count)
      if (normalizedIndex === currentIndexRef.current) return false
      currentIndexRef.current = normalizedIndex
      setCurrentIndex(normalizedIndex)
      if (notify) emitAfterChange(normalizedIndex)
      return true
    },
    [count, emitAfterChange],
  )

  const clearMomentumEndFallback = useCallback(() => {
    if (momentumEndFallbackRef.current) {
      clearTimeout(momentumEndFallbackRef.current)
      momentumEndFallbackRef.current = null
    }
  }, [])

  const cancelPendingScroll = useCallback(() => {
    clearMomentumEndFallback()
    draggingRef.current = false
    pendingScrollRef.current = false
    interactingRef.current = false
    setInteracting(false)
  }, [clearMomentumEndFallback])

  const startDraggingScroll = useCallback(() => {
    clearMomentumEndFallback()
    draggingRef.current = true
    protectedPhysicalIndexRef.current = null
    pendingScrollRef.current = true
    interactingRef.current = true
    setInteracting(true)
  }, [clearMomentumEndFallback])

  const startProgrammaticScroll = useCallback(
    (physicalIndex: number) => {
      clearMomentumEndFallback()
      draggingRef.current = false
      protectedPhysicalIndexRef.current = physicalIndex
      pendingScrollRef.current = true
      interactingRef.current = true
      setInteracting(true)
      const targetOffset = physicalIndex * pageSize
      latestAxisOffsetRef.current = targetOffset
      momentumEndFallbackRef.current = setTimeout(() => {
        momentumEndFallbackRef.current = null
        settleAtOffsetRef.current(targetOffset)
      }, PROGRAMMATIC_SCROLL_FALLBACK_DELAY)
    },
    [clearMomentumEndFallback, pageSize],
  )

  const goTo = useCallback(
    (index: number, animated = true) => {
      if (!Number.isInteger(index) || index < 0 || index >= count) {
        if (__DEV__) {
          console.warn(`Swipe.goTo(index): index must be between 0 and ${Math.max(count - 1, 0)}`)
        }
        return
      }
      const physicalIndex = toPhysicalIndex(index)
      if (pageSize <= 0) {
        setLogicalIndex(index, true)
        return
      }
      if (animated) {
        startProgrammaticScroll(physicalIndex)
      } else {
        cancelPendingScroll()
        protectedPhysicalIndexRef.current = physicalIndex
      }
      scrollToPhysicalIndex(physicalIndex, animated)
      if (!animated) {
        setLogicalIndex(index, true)
      }
    },
    [
      cancelPendingScroll,
      count,
      pageSize,
      scrollToPhysicalIndex,
      setLogicalIndex,
      startProgrammaticScroll,
      toPhysicalIndex,
    ],
  )

  const scrollToStart = useCallback(() => {
    if (count > 0) goTo(0, false)
  }, [count, goTo])

  const scrollToEnd = useCallback(() => {
    if (count > 0) goTo(count - 1, false)
  }, [count, goTo])

  const scrollNextPage = useCallback(() => {
    if (count < 2 || interactingRef.current || pageSize <= 0) return
    const nextIndex = currentIndexRef.current + 1
    if (nextIndex >= count) {
      if (!hasInfiniteClones) return
      startProgrammaticScroll(count + 1)
      scrollToPhysicalIndex(count + 1, true)
      return
    }
    const physicalIndex = toPhysicalIndex(nextIndex)
    startProgrammaticScroll(physicalIndex)
    scrollToPhysicalIndex(physicalIndex, true)
  }, [
    count,
    hasInfiniteClones,
    pageSize,
    scrollToPhysicalIndex,
    startProgrammaticScroll,
    toPhysicalIndex,
  ])

  useImperativeHandle(ref, () => ({ goTo, scrollNextPage, scrollToEnd, scrollToStart }), [
    goTo,
    scrollNextPage,
    scrollToEnd,
    scrollToStart,
  ])

  const settleAtOffset = useCallback(
    (offset: number) => {
      if (pageSize <= 0 || count === 0) return
      const rawPhysicalIndex = Math.round(offset / pageSize)
      const protectedPhysicalIndex = protectedPhysicalIndexRef.current
      if (protectedPhysicalIndex !== null) {
        if (rawPhysicalIndex !== protectedPhysicalIndex) return
        protectedPhysicalIndexRef.current = null
      }
      if (!pendingScrollRef.current) return

      clearMomentumEndFallback()
      let logicalIndex = rawPhysicalIndex
      let settledPhysicalIndex = rawPhysicalIndex

      if (hasInfiniteClones) {
        if (rawPhysicalIndex <= 0) {
          logicalIndex = count - 1
          settledPhysicalIndex = count
        } else if (rawPhysicalIndex >= count + 1) {
          logicalIndex = 0
          settledPhysicalIndex = 1
        } else {
          logicalIndex = rawPhysicalIndex - 1
        }
      }

      logicalIndex = clampIndex(logicalIndex, count)

      if (settledPhysicalIndex !== rawPhysicalIndex) {
        scrollToPhysicalIndex(settledPhysicalIndex, false)
      }
      setLogicalIndex(logicalIndex, true)
      pendingScrollRef.current = false
      draggingRef.current = false
      interactingRef.current = false
      setInteracting(false)
      emitScrollAnimationEnd()
    },
    [
      clearMomentumEndFallback,
      count,
      emitScrollAnimationEnd,
      hasInfiniteClones,
      pageSize,
      scrollToPhysicalIndex,
      setLogicalIndex,
    ],
  )
  settleAtOffsetRef.current = settleAtOffset

  const scheduleMomentumEndFallback = useCallback(
    (offset: number) => {
      if (!pendingScrollRef.current) return
      const protectedPhysicalIndex = protectedPhysicalIndexRef.current
      if (
        protectedPhysicalIndex !== null &&
        pageSize > 0 &&
        Math.abs(offset / pageSize - protectedPhysicalIndex) >= 0.01
      ) {
        return
      }
      latestAxisOffsetRef.current = offset
      clearMomentumEndFallback()
      momentumEndFallbackRef.current = setTimeout(() => {
        momentumEndFallbackRef.current = null
        settleAtOffset(latestAxisOffsetRef.current)
      }, MOMENTUM_END_FALLBACK_DELAY)
    },
    [clearMomentumEndFallback, pageSize, settleAtOffset],
  )

  const getAxisOffset = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) =>
      vertical ? event.nativeEvent.contentOffset.y : event.nativeEvent.contentOffset.x,
    [vertical],
  )

  const handleScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      startDraggingScroll()
      latestAxisOffsetRef.current = getAxisOffset(event)
      onScrollBeginDrag?.(event)
    },
    [getAxisOffset, onScrollBeginDrag, startDraggingScroll],
  )

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = getAxisOffset(event)
      latestAxisOffsetRef.current = offset
      if (pendingScrollRef.current && !draggingRef.current) {
        scheduleMomentumEndFallback(offset)
      }
      onScroll?.(event)
    },
    [getAxisOffset, onScroll, scheduleMomentumEndFallback],
  )

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = getAxisOffset(event)
      draggingRef.current = false
      scheduleMomentumEndFallback(offset)
      onScrollEndDrag?.(event)
    },
    [getAxisOffset, onScrollEndDrag, scheduleMomentumEndFallback],
  )

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!draggingRef.current) settleAtOffset(getAxisOffset(event))
      onMomentumScrollEnd?.(event)
    },
    [getAxisOffset, onMomentumScrollEnd, settleAtOffset],
  )

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      emitLayout(event)
      const { height, width } = event.nativeEvent.layout
      setLayout((previous) =>
        previous.height === height && previous.width === width ? previous : { height, width },
      )
    },
    [emitLayout],
  )

  useEffect(() => {
    if (selectedIndex === previousSelectedIndexRef.current) return
    previousSelectedIndexRef.current = selectedIndex
    if (selectedIndex === undefined || count === 0) return
    const nextIndex = clampIndex(selectedIndex, count)
    cancelPendingScroll()
    currentIndexRef.current = nextIndex
    setCurrentIndex(nextIndex)
    if (pageSize > 0) {
      const physicalIndex = toPhysicalIndex(nextIndex)
      protectedPhysicalIndexRef.current = physicalIndex
      scrollToPhysicalIndex(physicalIndex, false)
    }
  }, [cancelPendingScroll, count, pageSize, scrollToPhysicalIndex, selectedIndex, toPhysicalIndex])

  useEffect(() => {
    if (count === previousCountRef.current) return
    previousCountRef.current = count
    const nextIndex = clampIndex(selectedIndex ?? currentIndexRef.current, count)
    currentIndexRef.current = nextIndex
    setCurrentIndex(nextIndex)
  }, [count, selectedIndex])

  useEffect(() => {
    if (pageSize <= 0 || count === 0) return
    const physicalIndex = toPhysicalIndex(currentIndexRef.current)
    cancelPendingScroll()
    protectedPhysicalIndexRef.current = physicalIndex
    scrollToPhysicalIndex(physicalIndex, false)
  }, [
    cancelPendingScroll,
    count,
    hasInfiniteClones,
    pageSize,
    scrollToPhysicalIndex,
    toPhysicalIndex,
    vertical,
  ])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      setAppActive(isAppActive(status))
    })
    return () => subscription.remove()
  }, [])

  useEffect(() => clearMomentumEndFallback, [clearMomentumEndFallback])

  useEffect(() => {
    if (
      !autoplay ||
      !appActive ||
      interacting ||
      !scrollEnabled ||
      count < 2 ||
      autoplayInterval <= 0 ||
      (!hasInfiniteClones && currentIndex >= count - 1)
    ) {
      return
    }
    const timer = setTimeout(scrollNextPage, autoplayInterval)
    return () => clearTimeout(timer)
  }, [
    appActive,
    autoplay,
    autoplayInterval,
    count,
    currentIndex,
    hasInfiniteClones,
    interacting,
    scrollEnabled,
    scrollNextPage,
  ])

  const pageDescriptors = useMemo<PageDescriptor[]>(() => {
    const descriptors = items.map((_, logicalIndex) => ({
      clone: false,
      key: `page-${logicalIndex}`,
      logicalIndex,
    }))
    if (!hasInfiniteClones) return descriptors
    return [
      { clone: true, key: 'clone-start', logicalIndex: count - 1 },
      ...descriptors,
      { clone: true, key: 'clone-end', logicalIndex: 0 },
    ]
  }, [count, hasInfiniteClones, items])

  const renderedPages = pageDescriptors.map(({ clone, key, logicalIndex }) => {
    const shouldRender =
      !lazy || (typeof lazy === 'boolean' ? logicalIndex === currentIndex : lazy(logicalIndex))
    return (
      <View
        accessibilityElementsHidden={clone}
        accessibilityLabel={`${accessibilityLabel}_${logicalIndex}`}
        importantForAccessibility={clone ? 'no-hide-descendants' : 'auto'}
        key={key}
        style={[styles.page, pageStyle, { height: layout.height, width: layout.width }]}
      >
        {shouldRender ? items[logicalIndex] : renderLazyPlaceholder?.(logicalIndex)}
      </View>
    )
  })

  const paginationProps: SwipePaginationProps = {
    current: currentIndex,
    count,
    vertical,
    dotStyle,
    dotActiveStyle,
  }

  if (count === 0) return null

  return (
    <View onLayout={handleLayout} style={[styles.root, style]} testID={testID}>
      <ScrollView
        {...scrollViewProps}
        horizontal={!vertical}
        nestedScrollEnabled={nestedScrollEnabled}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        pagingEnabled
        ref={scrollViewRef}
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={scrollEventThrottle}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        testID={testID ? `${testID}-scroll-view` : undefined}
      >
        {renderedPages}
      </ScrollView>
      {dots && count > 1 ? (
        pagination ? (
          pagination(paginationProps)
        ) : (
          <View
            pointerEvents="none"
            style={[
              styles.pagination,
              vertical ? styles.paginationVertical : styles.paginationHorizontal,
            ]}
          >
            <View style={vertical ? styles.dotsVertical : styles.dotsHorizontal}>
              {items.map((_, index) => (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.dot,
                    dotStyle,
                    index === currentIndex && styles.dotActive,
                    index === currentIndex && dotActiveStyle,
                  ]}
                />
              ))}
            </View>
          </View>
        )
      ) : null}
    </View>
  )
}

export const Swipe = memo(forwardRef<SwipeRef, SwipeProps>(InternalSwipe))
