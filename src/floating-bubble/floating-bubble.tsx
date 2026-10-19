import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { Ref } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import type { LayoutChangeEvent, StyleProp, View as ViewComponent, ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from '../gesture'
import { Pressable } from '../pressable'
import { TeleportPortal as Portal } from '../portal/teleport-portal'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { Icon } from '../icon'
import type { IconProps } from '../icon'
import { snapMagneticOffset } from '../motion/gesture'
import { useMotionConfig } from '../motion/useMotionConfig'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { cancelAnimation, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
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
    const window = useWindowDimensions()
    const [portalSize, setPortalSize] = useState<{ width: number; height: number }>()
    const viewportWidth = portalSize?.width ?? window.width
    const viewportHeight = portalSize?.height ?? window.height
    const safeAreaInsets = useContext(SafeAreaInsetsContext)
    const token = useComponentToken('FloatingBubble', getFloatingBubbleToken)
    const policy = useMotionConfig()
    const animationDuration = policy.duration(token.animationDuration)
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
    const mountedRef = useRef(false)
    const committedSessionRef = useRef(-1)
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
    const viewportBounds = useMemo(
      () =>
        resolveBounds({
          viewportWidth,
          viewportHeight,
          bubbleWidth: bubbleSize?.width ?? 0,
          bubbleHeight: bubbleSize?.height ?? 0,
          gap: 0,
          topInset,
          bottomInset,
        }),
      [viewportWidth, viewportHeight, bubbleSize, topInset, bottomInset],
    )

    const commitOffset = useCallback(
      (x: number, y: number, session: number) => {
        if (
          !mountedRef.current ||
          session !== dragSession.value ||
          committedSessionRef.current === session
        )
          return
        committedSessionRef.current = session
        const next = { x, y }
        onOffsetChangeRef.current?.(next)
        onOffsetChangeEndRef.current?.(next)
        if (offsetPropRef.current !== undefined) requestControlledReconcile()
      },
      [dragSession, requestControlledReconcile],
    )

    const updateDragging = useCallback(
      (value: boolean, session: number) => {
        if (mountedRef.current && session === dragSession.value) setDragging(value)
      },
      [dragSession],
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

    const handlePortalLayout = useCallback((event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout
      if (Number.isFinite(width) && Number.isFinite(height)) {
        setPortalSize((current) =>
          current?.width === width && current.height === height ? current : { width, height },
        )
      }
    }, [])

    useEffect(() => {
      mountedRef.current = true
      return () => {
        mountedRef.current = false
        dragSession.value += 1
        cancelAnimation(translateX)
        cancelAnimation(translateY)
      }
    }, [dragSession, translateX, translateY])

    const offsetX = offset?.x
    const offsetY = offset?.y
    const defaultOffsetRef = useRef(defaultOffset)
    defaultOffsetRef.current = defaultOffset

    useLayoutEffect(() => {
      dragSession.value += 1
      cancelAnimation(translateX)
      cancelAnimation(translateY)
      draggingSV.value = false
      setDragging(false)
      minX.value = bounds.minX
      maxX.value = bounds.maxX
      minY.value = bounds.minY
      maxY.value = bounds.maxY

      if (!portalSize || !bubbleSize || viewportWidth <= 0 || viewportHeight <= 0) return

      if (!initializedRef.current) {
        const next = getInitialOffset(offsetPropRef.current ?? defaultOffsetRef.current, bounds)
        translateX.value = next.x
        translateY.value = next.y
        initializedRef.current = true
        setReady(true)
        return
      }

      if (offsetX !== undefined && offsetY !== undefined) {
        const next = getInitialOffset({ x: offsetX, y: offsetY }, bounds)
        translateX.value = next.x
        translateY.value = next.y
        return
      }

      translateX.value = clamp(translateX.value, bounds.minX, bounds.maxX)
      translateY.value = clamp(translateY.value, bounds.minY, bounds.maxY)
    }, [
      bounds,
      bubbleSize,
      portalSize,
      dragSession,
      draggingSV,
      maxX,
      maxY,
      minX,
      minY,
      offsetX,
      offsetY,
      translateX,
      translateY,
      viewportHeight,
      viewportWidth,
    ])

    useLayoutEffect(() => {
      const wasDragging = draggingSV.value
      dragSession.value += 1
      cancelAnimation(translateX)
      cancelAnimation(translateY)
      draggingSV.value = false
      setDragging(false)
      if (wasDragging && (disabled || axis === 'lock')) {
        const current = clampOffset({ x: translateX.value, y: translateY.value }, boundsRef.current)
        commitOffset(current.x, current.y, dragSession.value)
      } else if (offsetPropRef.current !== undefined) {
        const controlled = clampOffset(offsetPropRef.current, boundsRef.current)
        translateX.value = controlled.x
        translateY.value = controlled.y
      }
    }, [
      axis,
      disabled,
      magnetic,
      animationDuration,
      commitOffset,
      dragSession,
      draggingSV,
      translateX,
      translateY,
    ])

    useEffect(() => {
      if (controlledCommitVersion === 0 || offsetPropRef.current === undefined) return

      const controlled = clampOffset(offsetPropRef.current, boundsRef.current)
      translateX.value = controlled.x
      translateY.value = controlled.y
    }, [controlledCommitVersion, translateX, translateY])

    const gesture = useMemo(() => {
      const pan = Gesture.Pan()
        .enabled(ready && !disabled && axis !== 'lock')
        .minDistance(GESTURE_MIN_DISTANCE)
        .maxPointers(1)
        .onStart(() => {
          'worklet'
          dragSession.value += 1
          cancelAnimation(translateX)
          cancelAnimation(translateY)
          const current = clampOffset({ x: translateX.value, y: translateY.value }, viewportBounds)
          translateX.value = current.x
          translateY.value = current.y
          dragStartX.value = translateX.value
          dragStartY.value = translateY.value
          draggingSV.value = true
          scheduleOnRN(updateDragging, true, dragSession.value)
        })
        .onUpdate((event) => {
          'worklet'
          if (!draggingSV.value) return
          if (axis !== 'y') {
            translateX.value = clamp(
              dragStartX.value + event.translationX,
              Math.min(minX.value, dragStartX.value),
              Math.max(maxX.value, dragStartX.value),
            )
          }
          if (axis !== 'x') {
            translateY.value = clamp(
              dragStartY.value + event.translationY,
              Math.min(minY.value, dragStartY.value),
              Math.max(maxY.value, dragStartY.value),
            )
          }
        })
        .onEnd((event, success) => {
          'worklet'
          if (!draggingSV.value) return

          draggingSV.value = false
          scheduleOnRN(updateDragging, false, dragSession.value)
          const current = clampOffset(
            { x: translateX.value, y: translateY.value },
            { minX: minX.value, maxX: maxX.value, minY: minY.value, maxY: maxY.value },
          )
          translateX.value = current.x
          translateY.value = current.y
          if (!success) {
            scheduleOnRN(commitOffset, current.x, current.y, dragSession.value)
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
          const duration = animationDuration
          const finish = (finished?: boolean) => {
            'worklet'
            if (finished && session === dragSession.value) {
              scheduleOnRN(commitOffset, target.x, target.y, session)
            }
          }

          if (!changedX && !changedY) {
            scheduleOnRN(commitOffset, current.x, current.y, session)
            return
          }

          if (duration === 0) {
            translateX.value = target.x
            translateY.value = target.y
            scheduleOnRN(commitOffset, target.x, target.y, session)
            return
          }

          if (changedX) {
            translateX.value = snapMagneticOffset(
              target.x,
              duration,
              finish,
              axis === 'y' ? 0 : event.velocityX,
            )
          }
          if (changedY) {
            translateY.value = snapMagneticOffset(
              target.y,
              duration,
              changedX ? undefined : finish,
              axis === 'x' ? 0 : event.velocityY,
            )
          }
        })
        .onFinalize(() => {
          'worklet'
          if (draggingSV.value) {
            draggingSV.value = false
            scheduleOnRN(updateDragging, false, dragSession.value)
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

      return Gesture.Exclusive(pan, Gesture.Native().enabled(ready && !disabled))
    }, [
      axis,
      animationDuration,
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
      ready,
      translateX,
      translateY,
      updateDragging,
      viewportBounds,
    ])

    const animatedStyle = useAnimatedStyle(
      () => ({
        // Allow a small rebound inside the gap, without crossing the visible safe viewport.
        transform: [
          { translateX: clamp(translateX.value, viewportBounds.minX, viewportBounds.maxX) },
          { translateY: clamp(translateY.value, viewportBounds.minY, viewportBounds.maxY) },
        ],
      }),
      [translateX, translateY, viewportBounds],
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
    const resolvedIcon =
      isValidElement<IconProps>(icon) && icon.type === Icon
        ? cloneElement(icon, {
            color: icon.props.color ?? token.color,
            size: icon.props.size ?? token.iconSize,
          })
        : icon
    const content = children !== undefined ? children : resolvedIcon

    return (
      <Portal hostName="root">
        <View
          pointerEvents="box-none"
          style={StyleSheet.absoluteFill}
          onLayout={handlePortalLayout}
        >
          <GestureDetector gesture={gesture}>
            <Pressable
              ref={ref as Ref<never>}
              {...pressableProps}
              accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
              accessible={ready ? pressableProps.accessible : false}
              accessibilityElementsHidden={
                ready ? pressableProps.accessibilityElementsHidden : true
              }
              importantForAccessibility={
                ready ? pressableProps.importantForAccessibility : 'no-hide-descendants'
              }
              pointerEvents={ready ? pressableProps.pointerEvents : 'none'}
              disabled={disabled || !ready}
              onLayout={handleLayout}
              onPress={onPress}
              pressStyle="opacity"
              pressedOpacity={token.pressedOpacity}
              style={[
                resolvedStyles.root,
                semantic?.root,
                style,
                animatedStyle as unknown as StyleProp<ViewStyle>,
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
