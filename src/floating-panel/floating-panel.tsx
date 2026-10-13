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
import { Animated, ScrollView, useWindowDimensions, View } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useResponderPanGesture } from '../gesture/useResponderPanGesture'
import type { ResponderPanState } from '../gesture/useResponderPanGesture'
import { easeOut } from '../motion/easing'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { getFloatingPanelStyles } from './style'
import { getFloatingPanelToken } from './token'
import type { FloatingPanelProps } from './types'

const DEFAULT_MIN_HEIGHT = 100
const DEFAULT_MAX_HEIGHT_RATIO = 0.6
const DAMP = 0.2
const SNAP_DISTANCE = 32
const FLICK_DISTANCE = 8
// PanResponder velocity is measured in logical pixels per millisecond.
const FLICK_VELOCITY = 0.5

type DragSource = 'header' | 'content'

interface PanelConfig {
  anchors: number[]
  minHeight: number
  maxHeight: number
  placement: 'top' | 'bottom'
  magnetic: boolean
  draggable: boolean
  contentDraggable: boolean
  duration: number
}

function getDefaultMaxHeight(viewportHeight: number) {
  return Math.max(
    DEFAULT_MIN_HEIGHT,
    Math.round(Math.max(1, viewportHeight) * DEFAULT_MAX_HEIGHT_RATIO),
  )
}

function resolveAnchors(input: readonly number[] | undefined, viewportHeight: number) {
  const defaultMaxHeight = getDefaultMaxHeight(viewportHeight)
  const validAnchors = (input ?? [])
    .filter((anchor): anchor is number => Number.isFinite(anchor) && anchor > 0)
    .slice()
    .sort((left, right) => left - right)

  if (validAnchors.length === 0) return [DEFAULT_MIN_HEIGHT, defaultMaxHeight]
  if (validAnchors.length === 1) {
    return [validAnchors[0], defaultMaxHeight].sort((left, right) => left - right)
  }
  return validAnchors
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resolveHeight(value: number | undefined, fallback: number, min: number, max: number) {
  if (!Number.isFinite(value)) return clamp(fallback, min, max)
  return clamp(value as number, min, max)
}

function getClosestAnchor(anchors: readonly number[], target: number) {
  return anchors.reduce((previous, current) =>
    Math.abs(current - target) <= Math.abs(previous - target) ? current : previous,
  )
}

function getAdjacentAnchor(anchors: readonly number[], height: number, direction: number) {
  return direction > 0
    ? (anchors.find((anchor) => anchor > height) ?? anchors[anchors.length - 1])
    : (anchors
        .slice()
        .reverse()
        .find((anchor) => anchor < height) ?? anchors[0])
}

function getDampedHeight(
  height: number,
  distance: number,
  min: number,
  max: number,
  placement: 'top' | 'bottom',
) {
  const direction = placement === 'top' ? 1 : -1
  const rawHeight = height + distance * direction

  if (rawHeight > max) return max + (rawHeight - max) * DAMP
  return Math.max(min, rawHeight)
}

export const FloatingPanelContent = forwardRef<View, FloatingPanelProps>(
  function FloatingPanelContent(props, ref) {
    const { token: themeToken } = useToken()
    const token = useComponentToken('FloatingPanel', getFloatingPanelToken)
    const safeAreaInsets = useContext(SafeAreaInsetsContext)
    const {
      children,
      header,
      height,
      defaultHeight,
      anchors,
      placement = 'bottom',
      duration = token.animationDuration,
      magnetic = true,
      draggable = true,
      contentDraggable = true,
      safeAreaInsetBottom = true,
      safeAreaInsetTop,
      onHeightChange,
      onHeightChangeEnd,
      style,
      styles,
      ...viewProps
    } = props
    const { height: viewportHeight } = useWindowDimensions()
    const resolvedAnchors = useMemo(
      () => resolveAnchors(anchors, viewportHeight),
      [anchors, viewportHeight],
    )
    const minHeight = resolvedAnchors[0]
    const maxHeight = resolvedAnchors[resolvedAnchors.length - 1]
    const initialHeight = resolveHeight(height, defaultHeight ?? minHeight, minHeight, maxHeight)
    const [currentHeight, setCurrentHeight] = useState(initialHeight)
    const [dragging, setDragging] = useState(false)
    const [controlledCommitVersion, requestControlledReconcile] = useReducer(
      (value: number) => value + 1,
      0,
    )
    const currentHeightRef = useRef(currentHeight)
    const draggingRef = useRef(false)
    const startHeightRef = useRef(initialHeight)
    const scrollOffsetRef = useRef(0)
    const maxScrollRef = useRef(-1)
    const previousHeightPropRef = useRef(height)
    const previousMaxHeightRef = useRef(maxHeight)
    const previousPlacementRef = useRef(placement)
    const initializedRef = useRef(false)
    const animationRef = useRef<Animated.CompositeAnimation | null>(null)
    const panelHeight = useRef(new Animated.Value(initialHeight)).current
    const onHeightChangeRef = useRef(onHeightChange)
    const onHeightChangeEndRef = useRef(onHeightChangeEnd)
    const heightPropRef = useRef(height)
    const configRef = useRef<PanelConfig>({
      anchors: resolvedAnchors,
      minHeight,
      maxHeight,
      placement,
      magnetic,
      draggable,
      contentDraggable,
      duration: 0,
    })

    const normalizedDuration = Number.isFinite(duration)
      ? Math.max(0, duration)
      : token.animationDuration
    const animationDuration = themeToken.motion ? normalizedDuration : 0

    onHeightChangeRef.current = onHeightChange
    onHeightChangeEndRef.current = onHeightChangeEnd
    heightPropRef.current = height
    configRef.current = {
      anchors: resolvedAnchors,
      minHeight,
      maxHeight,
      placement,
      magnetic,
      draggable,
      contentDraggable,
      duration: animationDuration,
    }

    const setVisualHeight = useCallback((nextHeight: number, notify: boolean) => {
      const previousHeight = currentHeightRef.current
      currentHeightRef.current = nextHeight
      setCurrentHeight((value) => (Object.is(value, nextHeight) ? value : nextHeight))
      if (notify && !Object.is(previousHeight, nextHeight)) {
        onHeightChangeRef.current?.(nextHeight)
      }
    }, [])

    const requestControlledHeightReconcile = useCallback(() => {
      if (heightPropRef.current !== undefined) requestControlledReconcile()
    }, [requestControlledReconcile])

    const animateToHeight = useCallback(
      (nextHeight: number, onComplete?: () => void) => {
        const config = configRef.current
        const animatedValue = panelHeight
        const nextValue = nextHeight
        animationRef.current?.stop()
        animationRef.current = null

        if (config.duration === 0) {
          animatedValue.setValue(nextValue)
          onComplete?.()
          return
        }

        const nextAnimation = Animated.timing(animatedValue, {
          toValue: nextValue,
          duration: config.duration,
          easing: easeOut,
          isInteraction: false,
          useNativeDriver: false,
        })
        animationRef.current = nextAnimation
        nextAnimation.start(({ finished }) => {
          if (animationRef.current === nextAnimation) animationRef.current = null
          if (finished) {
            animatedValue.setValue(nextValue)
            onComplete?.()
          }
        })
      },
      [panelHeight],
    )

    const beginDrag = useCallback(() => {
      if (!configRef.current.draggable) return

      animationRef.current?.stop()
      animationRef.current = null
      draggingRef.current = true
      startHeightRef.current = currentHeightRef.current
      maxScrollRef.current = -1
      setDragging(true)
    }, [])

    const shouldClaimGesture = useCallback(
      (source: DragSource, gestureState: ResponderPanState) => {
        const config = configRef.current
        if (!config.draggable) return false
        if (source === 'header') return true
        if (!config.contentDraggable) return false

        if (config.placement === 'top' && currentHeightRef.current >= config.maxHeight) {
          return false
        }

        return (
          currentHeightRef.current < config.maxHeight ||
          (scrollOffsetRef.current <= 0 && gestureState.distance > 0 && maxScrollRef.current <= 0)
        )
      },
      [],
    )

    const updateDrag = useCallback(
      (distance: number) => {
        if (!draggingRef.current) return

        const config = configRef.current
        const nextHeight = getDampedHeight(
          startHeightRef.current,
          distance,
          config.minHeight,
          config.maxHeight,
          config.placement,
        )
        setVisualHeight(nextHeight, true)
        panelHeight.setValue(nextHeight)
      },
      [panelHeight, setVisualHeight],
    )

    const finishDrag = useCallback(
      (gesture?: ResponderPanState) => {
        if (!draggingRef.current) return

        draggingRef.current = false
        setDragging(false)
        maxScrollRef.current = -1

        const config = configRef.current
        const current = currentHeightRef.current
        let nextHeight = config.magnetic
          ? getClosestAnchor(config.anchors, current)
          : clamp(current, config.minHeight, config.maxHeight)
        const startedAt = startHeightRef.current
        if (config.magnetic && gesture) {
          const direction = config.placement === 'top' ? 1 : -1
          const distance = gesture.distance * direction
          const velocity = gesture.velocity * direction
          const flick = Math.abs(distance) >= FLICK_DISTANCE && Math.abs(velocity) >= FLICK_VELOCITY
          if (flick || Math.abs(distance) >= SNAP_DISTANCE) {
            const adjacent = getAdjacentAnchor(
              config.anchors,
              startedAt,
              flick ? velocity : distance,
            )
            // A long drag can pass several anchors; a short swipe advances at least one.
            nextHeight =
              (flick ? velocity : distance) > 0
                ? Math.max(nextHeight, adjacent)
                : Math.min(nextHeight, adjacent)
          }
        }
        const notifyHeightChangeEnd = () => {
          onHeightChangeEndRef.current?.(nextHeight)
          requestControlledHeightReconcile()
        }

        if (!Object.is(current, nextHeight)) {
          setVisualHeight(nextHeight, true)
          animateToHeight(nextHeight, notifyHeightChangeEnd)
        } else if (!Object.is(startedAt, nextHeight)) {
          notifyHeightChangeEnd()
        } else {
          requestControlledHeightReconcile()
        }
      },
      [animateToHeight, requestControlledHeightReconcile, setVisualHeight],
    )

    const headerResponder = useResponderPanGesture({
      axis: 'vertical',
      shouldActivate: (gestureState) => shouldClaimGesture('header', gestureState),
      onStart: beginDrag,
      onChange: ({ distance }) => updateDrag(distance),
      onEnd: finishDrag,
      onCancel: () => finishDrag(),
    })

    const contentResponder = useResponderPanGesture({
      axis: 'vertical',
      shouldActivate: (gestureState) => shouldClaimGesture('content', gestureState),
      onStart: beginDrag,
      onChange: ({ distance }) => updateDrag(distance),
      onEnd: finishDrag,
      onCancel: () => finishDrag(),
    })

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = Math.max(0, event.nativeEvent.contentOffset.y)
      scrollOffsetRef.current = offset
      if (draggingRef.current) maxScrollRef.current = Math.max(maxScrollRef.current, offset)
    }, [])

    useEffect(() => {
      const previousHeightProp = previousHeightPropRef.current
      const previousMaxHeight = previousMaxHeightRef.current
      const previousPlacement = previousPlacementRef.current
      const boundsChanged = previousMaxHeight !== maxHeight
      const placementChanged = previousPlacement !== placement
      previousHeightPropRef.current = height
      previousMaxHeightRef.current = maxHeight
      previousPlacementRef.current = placement

      if (draggingRef.current) return

      const nextHeight = resolveHeight(height, currentHeightRef.current, minHeight, maxHeight)
      if (
        initializedRef.current &&
        !boundsChanged &&
        !placementChanged &&
        !Object.is(previousHeightProp, height) &&
        Object.is(nextHeight, currentHeightRef.current)
      ) {
        return
      }
      setVisualHeight(nextHeight, false)

      if (
        initializedRef.current &&
        !boundsChanged &&
        !placementChanged &&
        !Object.is(previousHeightProp, height)
      ) {
        animateToHeight(nextHeight)
      } else {
        animationRef.current?.stop()
        animationRef.current = null
        panelHeight.setValue(nextHeight)
      }
      initializedRef.current = true
    }, [animateToHeight, height, maxHeight, minHeight, panelHeight, placement, setVisualHeight])

    const reconcileControlledHeight = useCallback(() => {
      if (heightPropRef.current === undefined) return

      const config = configRef.current
      const nextHeight = resolveHeight(
        heightPropRef.current,
        currentHeightRef.current,
        config.minHeight,
        config.maxHeight,
      )
      setVisualHeight(nextHeight, false)
      panelHeight.setValue(nextHeight)
    }, [panelHeight, setVisualHeight])

    useEffect(() => {
      if (controlledCommitVersion === 0) return
      reconcileControlledHeight()
    }, [controlledCommitVersion, reconcileControlledHeight])

    useEffect(
      () => () => {
        animationRef.current?.stop()
      },
      [],
    )

    const resolvedStyles = useMemo(
      () => getFloatingPanelStyles(token, placement),
      [placement, token],
    )
    const semantic = resolveStyles(styles, {
      props,
      state: { height: currentHeight, minHeight, maxHeight, dragging },
    })
    const bottomInset =
      placement === 'bottom' && safeAreaInsetBottom ? (safeAreaInsets?.bottom ?? 0) : 0
    const useTopSafeArea = safeAreaInsetTop ?? placement === 'top'
    const topInset = placement === 'top' && useTopSafeArea ? (safeAreaInsets?.top ?? 0) : 0
    const contentPadding =
      placement === 'top' ? { paddingTop: topInset } : { paddingBottom: bottomInset }
    const defaultHandle = header === undefined || header === null
    const handleAccessibilityAction = (action: string) => {
      if (!configRef.current.draggable || draggingRef.current) return
      if (action !== 'increment' && action !== 'decrement') return
      const nextHeight = getAdjacentAnchor(
        configRef.current.anchors,
        currentHeightRef.current,
        action === 'increment' ? 1 : -1,
      )
      if (Object.is(nextHeight, currentHeightRef.current)) return
      setVisualHeight(nextHeight, true)
      animateToHeight(nextHeight, () => {
        onHeightChangeEndRef.current?.(nextHeight)
        requestControlledHeightReconcile()
      })
    }
    const dragArea = header ?? <View style={[resolvedStyles.bar, semantic?.bar]} />
    const headerView =
      header !== undefined || draggable ? (
        <View
          {...headerResponder.panHandlers}
          accessible={defaultHandle && draggable ? true : undefined}
          accessibilityRole={defaultHandle && draggable ? 'adjustable' : undefined}
          accessibilityLabel={defaultHandle && draggable ? '面板高度' : undefined}
          accessibilityValue={
            defaultHandle && draggable
              ? {
                  min: minHeight,
                  max: maxHeight,
                  now: clamp(currentHeight, minHeight, maxHeight),
                }
              : undefined
          }
          accessibilityActions={
            defaultHandle && draggable
              ? [
                  { name: 'increment', label: '展开' },
                  { name: 'decrement', label: '收起' },
                ]
              : undefined
          }
          onAccessibilityAction={
            defaultHandle && draggable
              ? (event) => handleAccessibilityAction(event.nativeEvent.actionName)
              : undefined
          }
          style={[resolvedStyles.header, semantic?.header]}
        >
          {dragArea}
        </View>
      ) : null
    const contentView = (
      <View {...contentResponder.panHandlers} style={{ flex: 1 }}>
        <ScrollView
          style={[resolvedStyles.content, semantic?.content]}
          contentContainerStyle={[contentPadding, semantic?.contentContainer]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </View>
    )

    return (
      <Animated.View
        style={[resolvedStyles.container, semantic?.container, { height: panelHeight }]}
      >
        <View
          ref={ref}
          {...viewProps}
          collapsable={false}
          style={[resolvedStyles.root, semantic?.root, style]}
        >
          {placement === 'bottom' ? (
            <>
              {headerView}
              {contentView}
            </>
          ) : (
            <>
              {contentView}
              {headerView}
            </>
          )}
        </View>
      </Animated.View>
    )
  },
)

FloatingPanelContent.displayName = 'FloatingPanel.Content'

export const FloatingPanel = forwardRef<View, FloatingPanelProps>(
  function FloatingPanel(props, ref) {
    return (
      <Portal>
        <FloatingPanelContent {...props} ref={ref} />
      </Portal>
    )
  },
)

FloatingPanel.displayName = 'FloatingPanel'
