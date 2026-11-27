import { createContext, forwardRef, useCallback, useContext, useMemo, useRef } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import type {
  FloatingScrollProps,
  FloatingScrollScopeProps,
  FloatingScrollViewProps,
} from './types'

export interface FloatingScrollOffsetPair {
  x: SharedValue<number>
  y: SharedValue<number>
}

export interface FloatingScrollContextValue {
  offsets: ReadonlyArray<FloatingScrollOffsetPair>
  getTotalOffset: () => { x: number; y: number }
  subscribeScroll: (listener: () => void) => () => void
  subscribeScrollEnd: (listener: () => void) => () => void
}

const DISMISS_SCROLL_THRESHOLD = 1

export const FloatingScrollContext = createContext<FloatingScrollContextValue | null>(null)

export function useFloatingScrollContext(): FloatingScrollContextValue | null {
  return useContext(FloatingScrollContext)
}

function useFloatingScrollState() {
  const parent = useContext(FloatingScrollContext)
  const scrollX = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const lastDismissX = useSharedValue(0)
  const lastDismissY = useSharedValue(0)
  const hasScrollListeners = useSharedValue(false)
  const hasScrollEndListeners = useSharedValue(false)
  const scrollListenersRef = useRef(new Set<() => void>())
  const scrollEndListenersRef = useRef(new Set<() => void>())

  const ownOffset = useMemo<FloatingScrollOffsetPair>(
    () => ({ x: scrollX, y: scrollY }),
    [scrollX, scrollY],
  )
  const offsets = useMemo<ReadonlyArray<FloatingScrollOffsetPair>>(
    () => (parent ? [...parent.offsets, ownOffset] : [ownOffset]),
    [ownOffset, parent],
  )

  const getTotalOffset = useCallback(() => {
    let x = 0
    let y = 0
    for (let i = 0; i < offsets.length; i += 1) {
      x += offsets[i].x.get()
      y += offsets[i].y.get()
    }
    return { x, y }
  }, [offsets])

  const subscribeScroll = useCallback(
    (listener: () => void) => {
      scrollListenersRef.current.add(listener)
      hasScrollListeners.set(scrollListenersRef.current.size > 0)
      const unsubscribeParent = parent?.subscribeScroll(listener)
      return () => {
        scrollListenersRef.current.delete(listener)
        hasScrollListeners.set(scrollListenersRef.current.size > 0)
        unsubscribeParent?.()
      }
    },
    [hasScrollListeners, parent],
  )

  const subscribeScrollEnd = useCallback(
    (listener: () => void) => {
      scrollEndListenersRef.current.add(listener)
      hasScrollEndListeners.set(scrollEndListenersRef.current.size > 0)
      const unsubscribeParent = parent?.subscribeScrollEnd(listener)
      return () => {
        scrollEndListenersRef.current.delete(listener)
        hasScrollEndListeners.set(scrollEndListenersRef.current.size > 0)
        unsubscribeParent?.()
      }
    },
    [hasScrollEndListeners, parent],
  )

  const notifyScroll = useCallback(() => {
    for (const listener of scrollListenersRef.current) {
      listener()
    }
  }, [])

  const notifyScrollEnd = useCallback(() => {
    for (const listener of scrollEndListenersRef.current) {
      listener()
    }
  }, [])

  const contextValue = useMemo<FloatingScrollContextValue>(
    () => ({
      offsets,
      getTotalOffset,
      subscribeScroll,
      subscribeScrollEnd,
    }),
    [getTotalOffset, offsets, subscribeScroll, subscribeScrollEnd],
  )

  return {
    contextValue,
    scrollX,
    scrollY,
    lastDismissX,
    lastDismissY,
    hasScrollListeners,
    hasScrollEndListeners,
    notifyScroll,
    notifyScrollEnd,
  }
}

export function FloatingScrollScope({ children }: FloatingScrollScopeProps) {
  const {
    contextValue,
    scrollX,
    scrollY,
    lastDismissX,
    lastDismissY,
    notifyScroll,
    notifyScrollEnd,
  } = useFloatingScrollState()

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextX = event.nativeEvent.contentOffset.x
      const nextY = event.nativeEvent.contentOffset.y
      const dx = Math.abs(nextX - lastDismissX.get())
      const dy = Math.abs(nextY - lastDismissY.get())
      scrollX.set(nextX)
      scrollY.set(nextY)
      if (dx >= DISMISS_SCROLL_THRESHOLD || dy >= DISMISS_SCROLL_THRESHOLD) {
        lastDismissX.set(nextX)
        lastDismissY.set(nextY)
        notifyScroll()
      }
    },
    [lastDismissX, lastDismissY, notifyScroll, scrollX, scrollY],
  )

  const scrollProps = useMemo<FloatingScrollProps>(
    () => ({
      onScroll,
      onScrollEndDrag: notifyScrollEnd,
      onMomentumScrollEnd: notifyScrollEnd,
      scrollEventThrottle: 16,
    }),
    [notifyScrollEnd, onScroll],
  )

  return (
    <FloatingScrollContext.Provider value={contextValue}>
      {children(scrollProps)}
    </FloatingScrollContext.Provider>
  )
}

export const FloatingScrollView = forwardRef<ScrollView, FloatingScrollViewProps>(
  function FloatingScrollView(
    {
      children,
      onScroll: userOnScroll,
      onScrollEndDrag: userOnScrollEndDrag,
      onMomentumScrollEnd: userOnMomentumScrollEnd,
      scrollEventThrottle = 16,
      ...rest
    },
    ref,
  ) {
    const {
      contextValue,
      scrollX,
      scrollY,
      lastDismissX,
      lastDismissY,
      hasScrollListeners,
      hasScrollEndListeners,
      notifyScroll,
      notifyScrollEnd,
    } = useFloatingScrollState()

    const userOnScrollRef = useRef(userOnScroll)
    const userOnScrollEndDragRef = useRef(userOnScrollEndDrag)
    const userOnMomentumScrollEndRef = useRef(userOnMomentumScrollEnd)
    userOnScrollRef.current = userOnScroll
    userOnScrollEndDragRef.current = userOnScrollEndDrag
    userOnMomentumScrollEndRef.current = userOnMomentumScrollEnd

    const forwardScroll = useCallback((nativeEvent: NativeScrollEvent) => {
      userOnScrollRef.current?.({
        nativeEvent,
      } as NativeSyntheticEvent<NativeScrollEvent>)
    }, [])

    const forwardScrollEndDrag = useCallback((nativeEvent: NativeScrollEvent) => {
      userOnScrollEndDragRef.current?.({
        nativeEvent,
      } as NativeSyntheticEvent<NativeScrollEvent>)
    }, [])

    const forwardMomentumScrollEnd = useCallback((nativeEvent: NativeScrollEvent) => {
      userOnMomentumScrollEndRef.current?.({
        nativeEvent,
      } as NativeSyntheticEvent<NativeScrollEvent>)
    }, [])

    const hasUserOnScroll = Boolean(userOnScroll)
    const hasUserOnScrollEndDrag = Boolean(userOnScrollEndDrag)
    const hasUserOnMomentumScrollEnd = Boolean(userOnMomentumScrollEnd)

    const animatedScrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        const nextX = event.contentOffset.x
        const nextY = event.contentOffset.y
        scrollX.set(nextX)
        scrollY.set(nextY)

        if (hasScrollListeners.get()) {
          const dx = Math.abs(nextX - lastDismissX.get())
          const dy = Math.abs(nextY - lastDismissY.get())
          if (dx >= DISMISS_SCROLL_THRESHOLD || dy >= DISMISS_SCROLL_THRESHOLD) {
            lastDismissX.set(nextX)
            lastDismissY.set(nextY)
            scheduleOnRN(notifyScroll)
          }
        }

        if (hasUserOnScroll) {
          scheduleOnRN(forwardScroll, event)
        }
      },
      onEndDrag: (event) => {
        if (hasScrollEndListeners.get()) {
          scheduleOnRN(notifyScrollEnd)
        }
        if (hasUserOnScrollEndDrag) {
          scheduleOnRN(forwardScrollEndDrag, event)
        }
      },
      onMomentumEnd: (event) => {
        if (hasScrollEndListeners.get()) {
          scheduleOnRN(notifyScrollEnd)
        }
        if (hasUserOnMomentumScrollEnd) {
          scheduleOnRN(forwardMomentumScrollEnd, event)
        }
      },
    })

    return (
      <FloatingScrollContext.Provider value={contextValue}>
        <Animated.ScrollView
          {...rest}
          onScroll={animatedScrollHandler}
          ref={ref as never}
          scrollEventThrottle={scrollEventThrottle}
        >
          {children}
        </Animated.ScrollView>
      </FloatingScrollContext.Provider>
    )
  },
)
