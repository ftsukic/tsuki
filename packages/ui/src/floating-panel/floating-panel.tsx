import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponderGestureState,
} from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { getFloatingPanelStyles } from './style'
import { getFloatingPanelToken } from './token'
import type { FloatingPanelProps } from './interface'

const DEFAULT_MIN_HEIGHT = 100
const DEFAULT_MAX_HEIGHT_RATIO = 0.6
const DAMP = 0.2

type DragSource = 'header' | 'content'

interface PanelConfig {
  anchors: number[]
  minHeight: number
  maxHeight: number
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

function getDampedHeight(height: number, deltaY: number, min: number, max: number) {
  const rawHeight = height - deltaY

  if (rawHeight > max) return max + (rawHeight - max) * DAMP
  if (rawHeight < min) return min - (min - rawHeight) * DAMP
  return rawHeight
}

function isVerticalGesture(gestureState: PanResponderGestureState) {
  return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 2
}

export const FloatingPanel = forwardRef<View, FloatingPanelProps>(
  function FloatingPanel(props, ref) {
    const { token: themeToken } = useToken()
    const token = useComponentToken('FloatingPanel', getFloatingPanelToken)
    const safeAreaInsets = useContext(SafeAreaInsetsContext)
    const {
      children,
      header,
      height,
      defaultHeight,
      anchors,
      duration = token.animationDuration,
      magnetic = true,
      draggable = true,
      contentDraggable = true,
      safeAreaInsetBottom = true,
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
    const currentHeightRef = useRef(currentHeight)
    const draggingRef = useRef(false)
    const startHeightRef = useRef(initialHeight)
    const scrollOffsetRef = useRef(0)
    const maxScrollRef = useRef(-1)
    const previousHeightPropRef = useRef(height)
    const previousMaxHeightRef = useRef(maxHeight)
    const initializedRef = useRef(false)
    const animationRef = useRef<Animated.CompositeAnimation | null>(null)
    const translation = useRef(new Animated.Value(maxHeight - initialHeight)).current
    const onHeightChangeRef = useRef(onHeightChange)
    const onHeightChangeEndRef = useRef(onHeightChangeEnd)
    const configRef = useRef<PanelConfig>({
      anchors: resolvedAnchors,
      minHeight,
      maxHeight,
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
    configRef.current = {
      anchors: resolvedAnchors,
      minHeight,
      maxHeight,
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

    const animateToHeight = useCallback(
      (nextHeight: number, onComplete?: () => void) => {
        const config = configRef.current
        const nextTranslation = config.maxHeight - nextHeight
        animationRef.current?.stop()
        animationRef.current = null

        if (config.duration === 0) {
          translation.setValue(nextTranslation)
          onComplete?.()
          return
        }

        const nextAnimation = Animated.timing(translation, {
          toValue: nextTranslation,
          duration: config.duration,
          easing: Easing.bezier(0.18, 0.89, 0.32, 1.28),
          isInteraction: false,
          useNativeDriver: Platform.OS !== 'web',
        })
        animationRef.current = nextAnimation
        nextAnimation.start(({ finished }) => {
          if (animationRef.current === nextAnimation) animationRef.current = null
          if (finished) {
            translation.setValue(nextTranslation)
            onComplete?.()
          }
        })
      },
      [translation],
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
      (source: DragSource, gestureState: PanResponderGestureState) => {
        const config = configRef.current
        if (!config.draggable || !isVerticalGesture(gestureState)) return false
        if (source === 'header') return true
        if (!config.contentDraggable) return false

        return (
          currentHeightRef.current < config.maxHeight ||
          (scrollOffsetRef.current <= 0 && gestureState.dy > 0 && maxScrollRef.current <= 0)
        )
      },
      [],
    )

    const updateDrag = useCallback(
      (gestureState: PanResponderGestureState) => {
        if (!draggingRef.current) return

        const config = configRef.current
        const nextHeight = getDampedHeight(
          startHeightRef.current,
          gestureState.dy,
          config.minHeight,
          config.maxHeight,
        )
        setVisualHeight(nextHeight, true)
        translation.setValue(config.maxHeight - nextHeight)
      },
      [setVisualHeight, translation],
    )

    const finishDrag = useCallback(() => {
      if (!draggingRef.current) return

      draggingRef.current = false
      setDragging(false)
      maxScrollRef.current = -1

      const config = configRef.current
      const current = currentHeightRef.current
      const nextHeight = config.magnetic
        ? getClosestAnchor(config.anchors, current)
        : clamp(current, config.minHeight, config.maxHeight)
      const startedAt = startHeightRef.current
      const notifyHeightChangeEnd = () => onHeightChangeEndRef.current?.(nextHeight)

      if (!Object.is(current, nextHeight)) {
        setVisualHeight(nextHeight, true)
        animateToHeight(nextHeight, notifyHeightChangeEnd)
      } else if (!Object.is(startedAt, nextHeight)) {
        notifyHeightChangeEnd()
      }
    }, [animateToHeight, setVisualHeight])

    const headerResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => false,
          onStartShouldSetPanResponderCapture: () => false,
          onMoveShouldSetPanResponder: (_, gestureState) =>
            shouldClaimGesture('header', gestureState),
          onMoveShouldSetPanResponderCapture: (_, gestureState) =>
            shouldClaimGesture('header', gestureState),
          onPanResponderGrant: beginDrag,
          onPanResponderMove: (_, gestureState) => updateDrag(gestureState),
          onPanResponderRelease: finishDrag,
          onPanResponderTerminate: finishDrag,
          onPanResponderTerminationRequest: () => false,
        }),
      [beginDrag, finishDrag, shouldClaimGesture, updateDrag],
    )

    const contentResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => false,
          onStartShouldSetPanResponderCapture: () => false,
          onMoveShouldSetPanResponder: (_, gestureState) =>
            shouldClaimGesture('content', gestureState),
          onMoveShouldSetPanResponderCapture: (_, gestureState) =>
            shouldClaimGesture('content', gestureState),
          onPanResponderGrant: beginDrag,
          onPanResponderMove: (_, gestureState) => updateDrag(gestureState),
          onPanResponderRelease: finishDrag,
          onPanResponderTerminate: finishDrag,
          onPanResponderTerminationRequest: () => false,
        }),
      [beginDrag, finishDrag, shouldClaimGesture, updateDrag],
    )

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = Math.max(0, event.nativeEvent.contentOffset.y)
      scrollOffsetRef.current = offset
      if (draggingRef.current) maxScrollRef.current = Math.max(maxScrollRef.current, offset)
    }, [])

    useEffect(() => {
      const previousHeightProp = previousHeightPropRef.current
      const previousMaxHeight = previousMaxHeightRef.current
      const boundsChanged = previousMaxHeight !== maxHeight
      previousHeightPropRef.current = height
      previousMaxHeightRef.current = maxHeight

      if (draggingRef.current) return

      const nextHeight = resolveHeight(height, currentHeightRef.current, minHeight, maxHeight)
      setVisualHeight(nextHeight, false)

      if (initializedRef.current && !boundsChanged && !Object.is(previousHeightProp, height)) {
        animateToHeight(nextHeight)
      } else {
        animationRef.current?.stop()
        animationRef.current = null
        translation.setValue(maxHeight - nextHeight)
      }
      initializedRef.current = true
    }, [animateToHeight, height, maxHeight, minHeight, setVisualHeight, translation])

    useEffect(
      () => () => {
        animationRef.current?.stop()
      },
      [],
    )

    const resolvedStyles = useMemo(() => getFloatingPanelStyles(token), [token])
    const semantic = resolveStyles(styles, {
      props,
      state: { height: currentHeight, minHeight, maxHeight, dragging },
    })
    const bottomInset = safeAreaInsetBottom ? (safeAreaInsets?.bottom ?? 0) : 0
    const contentPaddingBottom = Math.max(0, maxHeight - currentHeight) + bottomInset

    return (
      <Portal>
        <Animated.View
          ref={ref}
          {...viewProps}
          collapsable={false}
          style={[
            resolvedStyles.root,
            { height: maxHeight },
            semantic?.root,
            style,
            { transform: [{ translateY: translation }] },
          ]}
        >
          {header !== undefined || draggable ? (
            <View
              {...headerResponder.panHandlers}
              style={[resolvedStyles.header, semantic?.header]}
            >
              {header ?? <View style={[resolvedStyles.bar, semantic?.bar]} />}
            </View>
          ) : null}
          <View {...contentResponder.panHandlers} style={{ flex: 1 }}>
            <ScrollView
              style={[resolvedStyles.content, semantic?.content]}
              contentContainerStyle={[
                { paddingBottom: contentPaddingBottom },
                semantic?.contentContainer,
              ]}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </Portal>
    )
  },
)

FloatingPanel.displayName = 'FloatingPanel'
