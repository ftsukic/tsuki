import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactElement } from 'react'
import { View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { Easing } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { Animated, useAnimatedStyle, useSharedValue, withTiming } from '../animation'
import { Gesture, GestureDetector } from '../gesture'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { scheduleOnRN } from 'react-native-worklets'
import { SwipeItem } from './swipe-item'
import { getSwipeStyles } from './style'
import { getSwipeToken } from './token'
import type { SwipeItemProps, SwipeProps, SwipeRef, SwipeToOptions } from './types'

const VANT_SPEED_THRESHOLD = 0.25
const LOCK_DISTANCE = 10

function isSwipeItem(value: unknown): value is ReactElement<SwipeItemProps> {
  return isValidElement(value) && value.type === SwipeItem
}

function clamp(value: number, min: number, max: number) {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

function normalize(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0
}

function resolveSwipeIndex(index: number, count: number, loop: boolean) {
  if (count <= 0) return 0
  const normalized = Math.trunc(index)
  return loop ? normalize(normalized, count) : clamp(normalized, 0, count - 1)
}

function getLazyIndices(index: number) {
  const result = new Set<number>([index])
  return result
}

interface SwipeItemSlotProps {
  item: ReactElement<SwipeItemProps>
  index: number
  count: number
  loop: boolean
  vertical: boolean
  autoHeight: boolean
  lazyRender: boolean
  rendered: boolean
  offsetSV: SharedValue<number>
  sizeSV: SharedValue<number>
}

function SwipeItemSlot({
  item,
  index,
  count,
  loop,
  vertical,
  autoHeight,
  lazyRender,
  rendered,
  offsetSV,
  sizeSV,
}: SwipeItemSlotProps) {
  const itemStyle = useAnimatedStyle(() => {
    const minOffset = sizeSV.value - sizeSV.value * count
    let itemOffset = 0
    if (loop && index === 0 && offsetSV.value < minOffset) itemOffset = sizeSV.value * count
    if (loop && index === count - 1 && offsetSV.value > 0) itemOffset = -sizeSV.value * count
    return vertical
      ? {
          height: sizeSV.value,
          width: '100%',
          transform: [{ translateY: itemOffset }],
        }
      : {
          ...(autoHeight ? {} : { height: '100%' }),
          width: sizeSV.value,
          transform: [{ translateX: itemOffset }],
        }
  }, [autoHeight, count, index, loop, offsetSV, sizeSV, vertical])

  return (
    <Animated.View key={item.key ?? index} {...item.props} style={[item.props.style, itemStyle]}>
      {!lazyRender || rendered ? item.props.children : null}
    </Animated.View>
  )
}

const SwipeComponent = forwardRef<SwipeRef, SwipeProps>(function Swipe(
  {
    children,
    autoplay = 0,
    duration,
    initialSwipe = 0,
    loop = true,
    showIndicators = true,
    vertical = false,
    touchable = true,
    lazyRender = false,
    autoHeight = false,
    width,
    height,
    indicatorColor,
    onChange,
    renderIndicator,
    style,
    styles,
    onLayout: userOnLayout,
    testID,
    ...viewProps
  },
  ref,
) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Swipe', getSwipeToken)
  const items = useMemo(() => Children.toArray(children).filter(isSwipeItem), [children])
  const count = items.length
  const resolvedLoop = loop && count > 1
  const initialActive = resolveSwipeIndex(initialSwipe, count, resolvedLoop)

  const activeSV = useSharedValue(initialActive)
  const offsetSV = useSharedValue(0)
  const sizeSV = useSharedValue(0)
  const swipingSV = useSharedValue(false)
  const touchStartOffsetSV = useSharedValue(0)
  const touchStartTimeSV = useSharedValue(0)
  const activeIndexRef = useRef(initialActive)
  const [activeIndex, setActiveIndex] = useState(initialActive)
  const [renderedIndices, setRenderedIndices] = useState(() => getLazyIndices(initialActive))
  const [dragging, setDragging] = useState(false)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const size = vertical ? (height ?? viewport.height) : (width ?? viewport.width)
  const resolvedDuration =
    themeToken.motion === false ? 0 : Math.max(0, duration ?? token.animationDuration)
  const resolvedStyles = getSwipeStyles(token, vertical, size || undefined, autoHeight)
  const swipeProps = useMemo<SwipeProps>(
    () => ({
      children,
      autoplay,
      duration,
      initialSwipe,
      loop,
      showIndicators,
      vertical,
      touchable,
      lazyRender,
      autoHeight,
      width,
      height,
      indicatorColor,
      onChange,
      renderIndicator,
      style,
      styles,
    }),
    [
      autoHeight,
      autoplay,
      children,
      duration,
      height,
      indicatorColor,
      initialSwipe,
      lazyRender,
      loop,
      onChange,
      renderIndicator,
      showIndicators,
      style,
      styles,
      touchable,
      vertical,
      width,
    ],
  )
  const semanticStyles = resolveStyles(styles, {
    props: swipeProps,
    state: { activeIndex, total: count, vertical, dragging },
  })
  const actualStyles = indicatorColor
    ? {
        ...resolvedStyles,
        activeIndicator: { ...resolvedStyles.activeIndicator, backgroundColor: indicatorColor },
      }
    : resolvedStyles

  const clearAutoplay = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const publishActive = useCallback(
    (active: number, emitChange: boolean) => {
      const logical = resolveSwipeIndex(active, count, resolvedLoop)
      const changed = logical !== activeIndexRef.current
      activeIndexRef.current = logical
      setActiveIndex(logical)
      setRenderedIndices((current) => {
        const next = new Set(current)
        getLazyIndices(logical).forEach((index) => next.add(index))
        return next
      })
      if (emitChange && changed) onChangeRef.current?.(logical)
    },
    [count, resolvedLoop],
  )

  const getSize = useCallback(() => sizeSV.value, [sizeSV])
  const getTrackSize = useCallback(() => getSize() * count, [count, getSize])
  const getMinOffset = useCallback(() => getSize() - getTrackSize(), [getSize, getTrackSize])
  const getTargetActive = useCallback(
    (pace: number) => {
      const current = activeSV.value
      if (pace)
        return resolvedLoop
          ? clamp(current + pace, -1, count)
          : clamp(current + pace, 0, Math.max(0, count - 1))
      return current
    },
    [activeSV, count, resolvedLoop],
  )
  const getTargetOffset = useCallback(
    (targetActive: number, extraOffset = 0) => {
      const target = extraOffset - targetActive * getSize()
      return resolvedLoop ? target : clamp(target, getMinOffset(), 0)
    },
    [getMinOffset, getSize, resolvedLoop],
  )

  const correctPosition = useCallback(() => {
    if (!resolvedLoop || count === 0) return
    if (activeSV.value <= -1) {
      activeSV.value = count - 1
      offsetSV.value = -(count - 1) * getSize()
    } else if (activeSV.value >= count) {
      activeSV.value = 0
      offsetSV.value = 0
    }
  }, [activeSV, count, getSize, offsetSV, resolvedLoop])

  const move = useCallback(
    ({
      pace = 0,
      offset,
      emitChange = false,
      immediate = false,
    }: {
      pace?: number
      offset?: number
      emitChange?: boolean
      immediate?: boolean
    } = {}) => {
      if (count <= 1) return
      const targetActive = getTargetActive(pace)
      const targetOffset = getTargetOffset(targetActive, offset ?? 0)
      activeSV.value = targetActive
      publishActive(targetActive, emitChange)
      const finish = (finished?: boolean) => {
        'worklet'
        if (!finished || !resolvedLoop) return
        if (activeSV.value <= -1) {
          activeSV.value = count - 1
          offsetSV.value = -(count - 1) * sizeSV.value
        } else if (activeSV.value >= count) {
          activeSV.value = 0
          offsetSV.value = 0
        }
      }
      if (immediate || resolvedDuration === 0) {
        offsetSV.value = targetOffset
        finish(true)
        return
      }
      offsetSV.value = withTiming(
        targetOffset,
        {
          duration: resolvedDuration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        finish,
      )
    },
    [
      activeSV,
      count,
      getTargetActive,
      getTargetOffset,
      offsetSV,
      publishActive,
      resolvedDuration,
      resolvedLoop,
      sizeSV,
    ],
  )

  const prev = useCallback(() => {
    clearAutoplay()
    correctPosition()
    move({ pace: -1, emitChange: true })
  }, [clearAutoplay, correctPosition, move])
  const next = useCallback(() => {
    clearAutoplay()
    correctPosition()
    move({ pace: 1, emitChange: true })
  }, [clearAutoplay, correctPosition, move])
  const scheduleAutoplay = useCallback(() => {
    clearAutoplay()
    if (autoplay <= 0 || count <= 1) return
    timerRef.current = setTimeout(() => {
      next()
      scheduleAutoplay()
    }, autoplay)
  }, [autoplay, clearAutoplay, count, next])
  const swipeTo = useCallback(
    (index: number, options?: SwipeToOptions) => {
      clearAutoplay()
      correctPosition()
      const target = resolveSwipeIndex(index, count, resolvedLoop)
      move({
        pace: target - activeSV.value,
        emitChange: options?.emitChange ?? true,
        immediate: options?.immediate,
      })
      if (options?.immediate) scheduleAutoplay()
    },
    [activeSV, clearAutoplay, count, correctPosition, move, resolvedLoop, scheduleAutoplay],
  )

  useImperativeHandle(ref, () => ({ prev, next, swipeTo }), [next, prev, swipeTo])

  useEffect(() => {
    if (!size || !Number.isFinite(size)) return
    sizeSV.value = size
    const current = resolveSwipeIndex(activeIndexRef.current, count, resolvedLoop)
    activeIndexRef.current = current
    activeSV.value = current
    offsetSV.value = getTargetOffset(current)
  }, [activeSV, count, getTargetOffset, offsetSV, resolvedLoop, size, sizeSV])

  useEffect(() => {
    const normalized = resolveSwipeIndex(activeIndexRef.current, count, resolvedLoop)
    activeIndexRef.current = normalized
    activeSV.value = normalized
    offsetSV.value = getTargetOffset(normalized)
    setActiveIndex(normalized)
    setRenderedIndices(getLazyIndices(normalized))
  }, [activeSV, count, getTargetOffset, offsetSV, resolvedLoop])

  useEffect(() => {
    scheduleAutoplay()
    return clearAutoplay
  }, [clearAutoplay, scheduleAutoplay])

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(touchable && count > 1 && Boolean(size))
      .maxPointers(1)
    const directional = vertical
      ? pan
          .activeOffsetY([-LOCK_DISTANCE, LOCK_DISTANCE])
          .failOffsetX([-LOCK_DISTANCE, LOCK_DISTANCE])
      : pan
          .activeOffsetX([-LOCK_DISTANCE, LOCK_DISTANCE])
          .failOffsetY([-LOCK_DISTANCE, LOCK_DISTANCE])

    if (testID) directional.withTestId(`${testID}-gesture`)

    return directional
      .onStart(() => {
        'worklet'
        swipingSV.value = true
        touchStartOffsetSV.value = offsetSV.value
        touchStartTimeSV.value = Date.now()
        scheduleOnRN(clearAutoplay)
        scheduleOnRN(setDragging, true)
      })
      .onUpdate((event) => {
        'worklet'
        const delta = vertical ? event.translationY : event.translationX
        const nextOffset = touchStartOffsetSV.value + delta
        const minOffset = sizeSV.value - sizeSV.value * count
        offsetSV.value = resolvedLoop ? nextOffset : clamp(nextOffset, minOffset, 0)
      })
      .onEnd((event, success) => {
        'worklet'
        const delta = vertical ? event.translationY : event.translationX
        const elapsed = Math.max(1, Date.now() - touchStartTimeSV.value)
        const speed = delta / elapsed
        const shouldSwipe =
          success && (Math.abs(speed) > VANT_SPEED_THRESHOLD || Math.abs(delta) > sizeSV.value / 2)
        let pace = 0
        if (shouldSwipe) {
          if (resolvedLoop) pace = delta > 0 ? -1 : 1
          else pace = -Math[delta > 0 ? 'ceil' : 'floor'](delta / sizeSV.value)
        }
        swipingSV.value = false
        scheduleOnRN(setDragging, false)
        scheduleOnRN(move, { pace, emitChange: true })
        scheduleOnRN(scheduleAutoplay)
      })
  }, [
    clearAutoplay,
    count,
    move,
    offsetSV,
    resolvedLoop,
    scheduleAutoplay,
    size,
    sizeSV,
    swipingSV,
    testID,
    touchStartOffsetSV,
    touchStartTimeSV,
    touchable,
    vertical,
  ])

  const trackStyle = useAnimatedStyle(
    () =>
      vertical
        ? {
            height: sizeSV.value * count,
            width: '100%',
            transform: [{ translateY: offsetSV.value }],
          }
        : {
            ...(autoHeight ? {} : { height: '100%' }),
            width: sizeSV.value * count,
            transform: [{ translateX: offsetSV.value }],
          },
    [autoHeight, count, offsetSV, sizeSV, vertical],
  )

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout
      setViewport((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      )
      userOnLayout?.(event)
    },
    [userOnLayout],
  )

  const renderedItems = items.map((item, index) => (
    <SwipeItemSlot
      key={item.key ?? index}
      item={item}
      index={index}
      count={count}
      loop={resolvedLoop}
      vertical={vertical}
      autoHeight={autoHeight}
      lazyRender={lazyRender}
      rendered={renderedIndices.has(index)}
      offsetSV={offsetSV}
      sizeSV={sizeSV}
    />
  ))
  const track = (
    <Animated.View
      style={[resolvedStyles.track, semanticStyles?.track, trackStyle]}
      testID={testID ? `${testID}-track` : undefined}
    >
      {renderedItems}
    </Animated.View>
  )
  const content = touchable ? <GestureDetector gesture={gesture}>{track}</GestureDetector> : track

  return (
    <View
      testID={testID}
      {...viewProps}
      onLayout={handleLayout}
      style={[resolvedStyles.root, semanticStyles?.root, style]}
    >
      {content}
      {showIndicators &&
        count > 1 &&
        (renderIndicator ? (
          renderIndicator({ activeIndex, total: count })
        ) : (
          <View
            pointerEvents="none"
            style={[resolvedStyles.indicators, semanticStyles?.indicators]}
          >
            {Array.from({ length: count }, (_, index) => (
              <View
                key={index}
                style={[
                  resolvedStyles.indicator,
                  semanticStyles?.indicator,
                  index === activeIndex && [
                    actualStyles.activeIndicator,
                    semanticStyles?.activeIndicator,
                  ],
                ]}
              />
            ))}
          </View>
        ))}
    </View>
  )
})

export const Swipe = Object.assign(SwipeComponent, { Item: SwipeItem })
