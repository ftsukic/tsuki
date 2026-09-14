import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { Ref } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import type { LayoutChangeEvent, View as ViewComponent } from 'react-native'
import { Gesture, GestureDetector } from '../gesture'
import { Pressable } from '../pressable'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { getFloatingBubbleStyles } from './style'
import { getFloatingBubbleToken } from './token'
import type { FloatingBubbleMagnetic, FloatingBubbleOffset, FloatingBubbleProps } from './types'

const GESTURE_MIN_DISTANCE = 7

export interface FloatingBubbleBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface FloatingBubbleBoundsInput {
  viewportWidth: number
  viewportHeight: number
  bubbleWidth: number
  bubbleHeight: number
  gap: number
  topInset?: number
  bottomInset?: number
}

function finiteOr(value: number, fallback: number) {
  'worklet'
  return Number.isFinite(value) ? value : fallback
}

function normalizeRange(min: number, max: number) {
  const safeMin = Math.max(0, min)
  return max < safeMin ? { min: safeMin, max: safeMin } : { min: safeMin, max }
}

export function resolveBounds(input: FloatingBubbleBoundsInput): FloatingBubbleBounds {
  const gap = Math.max(0, finiteOr(input.gap, 0))
  const topInset = Math.max(0, finiteOr(input.topInset ?? 0, 0))
  const bottomInset = Math.max(0, finiteOr(input.bottomInset ?? 0, 0))
  const viewportWidth = Math.max(0, finiteOr(input.viewportWidth, 0))
  const viewportHeight = Math.max(0, finiteOr(input.viewportHeight, 0))
  const bubbleWidth = Math.max(0, finiteOr(input.bubbleWidth, 0))
  const bubbleHeight = Math.max(0, finiteOr(input.bubbleHeight, 0))
  const xRange = normalizeRange(gap, viewportWidth - bubbleWidth - gap)
  const yRange = normalizeRange(topInset + gap, viewportHeight - bottomInset - bubbleHeight - gap)

  return {
    minX: xRange.min,
    maxX: xRange.max,
    minY: yRange.min,
    maxY: yRange.max,
  }
}

function clamp(value: number, min: number, max: number) {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

export function clampOffset(offset: FloatingBubbleOffset, bounds: FloatingBubbleBounds) {
  'worklet'
  return {
    x: clamp(finiteOr(offset.x, bounds.maxX), bounds.minX, bounds.maxX),
    y: clamp(finiteOr(offset.y, bounds.maxY), bounds.minY, bounds.maxY),
  }
}

export function resolveMagneticTarget(
  offset: FloatingBubbleOffset,
  bounds: FloatingBubbleBounds,
  magnetic: FloatingBubbleMagnetic | undefined,
) {
  'worklet'
  const current = clampOffset(offset, bounds)
  if (magnetic === 'x') {
    return {
      x: current.x - bounds.minX <= bounds.maxX - current.x ? bounds.minX : bounds.maxX,
      y: current.y,
    }
  }
  if (magnetic === 'y') {
    return {
      x: current.x,
      y: current.y - bounds.minY <= bounds.maxY - current.y ? bounds.minY : bounds.maxY,
    }
  }
  return current
}

function getInitialOffset(offset: FloatingBubbleOffset | undefined, bounds: FloatingBubbleBounds) {
  return clampOffset(offset ?? { x: bounds.maxX, y: bounds.maxY }, bounds)
}

export const FloatingBubble = forwardRef<ViewComponent, FloatingBubbleProps>(
  function FloatingBubble(
    {
      children,
      icon,
      axis = 'y',
      magnetic,
      gap,
      offset,
      defaultOffset,
      onOffsetChange,
      onOffsetChangeEnd,
      safeAreaInsetTop = true,
      safeAreaInsetBottom = true,
      disabled: disabledProp,
      style,
      styles,
      onLayout: userOnLayout,
      onPress,
      ...pressableProps
    },
    ref,
  ) {
    const { width: viewportWidth, height: viewportHeight } = useWindowDimensions()
    const safeAreaInsets = useContext(SafeAreaInsetsContext)
    const { token: themeToken } = useToken()
    const token = useComponentToken('FloatingBubble', getFloatingBubbleToken)
    const disabled = disabledProp === true
    const resolvedGap = Number.isFinite(gap) ? Math.max(0, gap as number) : token.gap
    const topInset = safeAreaInsetTop ? (safeAreaInsets?.top ?? 0) : 0
    const bottomInset = safeAreaInsetBottom ? (safeAreaInsets?.bottom ?? 0) : 0
    const [bubbleSize, setBubbleSize] = useState<{ width: number; height: number }>()
    const [ready, setReady] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [controlledCommitVersion, requestControlledReconcile] = useReducer(
      (value: number) => value + 1,
      0,
    )
    const initializedRef = useRef(false)
    const currentOffsetRef = useRef<FloatingBubbleOffset>({ x: 0, y: 0 })
    const boundsRef = useRef<FloatingBubbleBounds>({ minX: 0, maxX: 0, minY: 0, maxY: 0 })
    const offsetPropRef = useRef(offset)
    const onOffsetChangeRef = useRef(onOffsetChange)
    const onOffsetChangeEndRef = useRef(onOffsetChangeEnd)
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const dragStartX = useSharedValue(0)
    const dragStartY = useSharedValue(0)
    const minX = useSharedValue(0)
    const maxX = useSharedValue(0)
    const minY = useSharedValue(0)
    const maxY = useSharedValue(0)
    const draggingSV = useSharedValue(false)
    const dragSession = useSharedValue(0)

    onOffsetChangeRef.current = onOffsetChange
    onOffsetChangeEndRef.current = onOffsetChangeEnd
    offsetPropRef.current = offset

    const bounds = useMemo(
      () =>
        resolveBounds({
          viewportWidth,
          viewportHeight,
          bubbleWidth: bubbleSize?.width ?? 0,
          bubbleHeight: bubbleSize?.height ?? 0,
          gap: resolvedGap,
          topInset,
          bottomInset,
        }),
      [bottomInset, bubbleSize, resolvedGap, topInset, viewportHeight, viewportWidth],
    )
    boundsRef.current = bounds

    const commitOffset = useCallback(
      (x: number, y: number) => {
        const next = { x, y }
        currentOffsetRef.current = next
        onOffsetChangeRef.current?.(next)
        onOffsetChangeEndRef.current?.(next)
        if (offsetPropRef.current !== undefined) requestControlledReconcile()
      },
      [requestControlledReconcile],
    )

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout
        if (Number.isFinite(width) && Number.isFinite(height)) {
          setBubbleSize((current) =>
            current?.width === width && current.height === height ? current : { width, height },
          )
        }
        userOnLayout?.(event)
      },
      [userOnLayout],
    )

    useEffect(() => {
      minX.value = bounds.minX
      maxX.value = bounds.maxX
      minY.value = bounds.minY
      maxY.value = bounds.maxY

      if (!bubbleSize || viewportWidth <= 0 || viewportHeight <= 0) return

      if (!initializedRef.current) {
        const next = getInitialOffset(offset ?? defaultOffset, bounds)
        translateX.value = next.x
        translateY.value = next.y
        currentOffsetRef.current = next
        initializedRef.current = true
        setReady(true)
        return
      }

      if (offset !== undefined) {
        const next = getInitialOffset(offset, bounds)
        translateX.value = next.x
        translateY.value = next.y
        currentOffsetRef.current = next
        return
      }

      translateX.value = clamp(translateX.value, bounds.minX, bounds.maxX)
      translateY.value = clamp(translateY.value, bounds.minY, bounds.maxY)
    }, [
      bounds,
      bubbleSize,
      defaultOffset,
      maxX,
      maxY,
      minX,
      minY,
      offset,
      translateX,
      translateY,
      viewportHeight,
      viewportWidth,
    ])

    useEffect(() => {
      if (controlledCommitVersion === 0 || offsetPropRef.current === undefined) return

      const controlled = clampOffset(offsetPropRef.current, boundsRef.current)
      translateX.value = controlled.x
      translateY.value = controlled.y
      currentOffsetRef.current = controlled
    }, [controlledCommitVersion, translateX, translateY])

    const gesture = useMemo(() => {
      const pan = Gesture.Pan()
        .enabled(!disabled && axis !== 'lock')
        .minDistance(GESTURE_MIN_DISTANCE)
        .maxPointers(1)
        .onStart(() => {
          'worklet'
          dragSession.value += 1
          dragStartX.value = translateX.value
          dragStartY.value = translateY.value
          draggingSV.value = true
          scheduleOnRN(setDragging, true)
        })
        .onUpdate((event) => {
          'worklet'
          if (axis !== 'y') {
            translateX.value = clamp(dragStartX.value + event.translationX, minX.value, maxX.value)
          }
          if (axis !== 'x') {
            translateY.value = clamp(dragStartY.value + event.translationY, minY.value, maxY.value)
          }
        })
        .onEnd((_, success) => {
          'worklet'
          if (!draggingSV.value) return

          draggingSV.value = false
          scheduleOnRN(setDragging, false)
          const current = clampOffset(
            { x: translateX.value, y: translateY.value },
            { minX: minX.value, maxX: maxX.value, minY: minY.value, maxY: maxY.value },
          )
          translateX.value = current.x
          translateY.value = current.y
          if (!success) {
            scheduleOnRN(commitOffset, current.x, current.y)
            return
          }

          const target = resolveMagneticTarget(
            current,
            { minX: minX.value, maxX: maxX.value, minY: minY.value, maxY: maxY.value },
            magnetic,
          )
          const changedX = target.x !== current.x
          const changedY = target.y !== current.y
          const session = dragSession.value
          const duration = themeToken.motion ? Math.max(0, token.animationDuration) : 0
          const finish = (finished?: boolean) => {
            'worklet'
            if (finished && session === dragSession.value) {
              scheduleOnRN(commitOffset, target.x, target.y)
            }
          }

          if (!changedX && !changedY) {
            scheduleOnRN(commitOffset, current.x, current.y)
            return
          }

          if (duration === 0) {
            translateX.value = target.x
            translateY.value = target.y
            scheduleOnRN(commitOffset, target.x, target.y)
            return
          }

          if (changedX) {
            translateX.value = withTiming(target.x, { duration }, finish)
          }
          if (changedY) {
            translateY.value = withTiming(target.y, { duration }, changedX ? undefined : finish)
          }
        })

      if (axis === 'x') {
        pan.activeOffsetX([-GESTURE_MIN_DISTANCE, GESTURE_MIN_DISTANCE])
        pan.failOffsetY([-GESTURE_MIN_DISTANCE, GESTURE_MIN_DISTANCE])
      } else if (axis === 'y') {
        pan.activeOffsetY([-GESTURE_MIN_DISTANCE, GESTURE_MIN_DISTANCE])
        pan.failOffsetX([-GESTURE_MIN_DISTANCE, GESTURE_MIN_DISTANCE])
      }

      const testID = pressableProps.testID
      if (testID) pan.withTestId(`${testID}-gesture`)

      return Gesture.Exclusive(pan, Gesture.Native().enabled(!disabled))
    }, [
      axis,
      commitOffset,
      disabled,
      dragSession,
      dragStartX,
      dragStartY,
      draggingSV,
      magnetic,
      maxX,
      maxY,
      minX,
      minY,
      pressableProps.testID,
      themeToken.motion,
      token.animationDuration,
      translateX,
      translateY,
    ])

    const animatedStyle = useAnimatedStyle(
      () => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      }),
      [translateX, translateY],
    )
    const resolvedStyles = useMemo(() => getFloatingBubbleStyles(token), [token])
    const bubbleProps: FloatingBubbleProps = {
      ...pressableProps,
      children,
      icon,
      axis,
      magnetic,
      gap,
      offset,
      defaultOffset,
      onOffsetChange,
      onOffsetChangeEnd,
      safeAreaInsetTop,
      safeAreaInsetBottom,
      disabled,
      style,
      styles,
      onLayout: userOnLayout,
      onPress,
    }
    const semantic = resolveStyles(styles, {
      props: bubbleProps,
      state: { dragging },
    })
    const content = children ?? icon

    return (
      <Portal>
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <GestureDetector gesture={gesture}>
            <Pressable
              ref={ref as Ref<never>}
              {...pressableProps}
              accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
              disabled={disabled}
              onLayout={handleLayout}
              onPress={onPress}
              pressStyle="none"
              style={({ pressed }) => [
                resolvedStyles.root,
                semantic?.root,
                style,
                animatedStyle,
                pressed && !disabled ? { opacity: token.pressedOpacity } : undefined,
                ready ? undefined : { opacity: 0 },
              ]}
            >
              <View style={[resolvedStyles.content, semantic?.content]}>
                {icon !== undefined && children === undefined ? (
                  <View style={[resolvedStyles.icon, semantic?.icon]}>{content}</View>
                ) : (
                  content
                )}
              </View>
            </Pressable>
          </GestureDetector>
        </View>
      </Portal>
    )
  },
)

FloatingBubble.displayName = 'FloatingBubble'
