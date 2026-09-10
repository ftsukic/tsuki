import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Platform, ScrollView, useWindowDimensions, View } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { usePanGesture } from '../interaction'
import type { PanGestureState } from '../interaction'
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

function getBottomTranslation(height: number, maxHeight: number) {
  return maxHeight - height
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
  if (rawHeight < min) return min - (min - rawHeight) * DAMP
  return rawHeight
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
    const translation = useRef(
      new Animated.Value(getBottomTranslation(initialHeight, maxHeight)),
    ).current
    const panelHeight = useRef(new Animated.Value(initialHeight)).current
    const onHeightChangeRef = useRef(onHeightChange)
    const onHeightChangeEndRef = useRef(onHeightChangeEnd)
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

    const animateToHeight = useCallback(
      (nextHeight: number, onComplete?: () => void) => {
        const config = configRef.current
        const animatedValue = config.placement === 'top' ? panelHeight : translation
        const nextValue =
          config.placement === 'top'
            ? nextHeight
            : getBottomTranslation(nextHeight, config.maxHeight)
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
          easing: Easing.bezier(0.18, 0.89, 0.32, 1.28),
          isInteraction: false,
          useNativeDriver: config.placement === 'bottom' && Platform.OS !== 'web',
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
      [panelHeight, translation],
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

    const shouldClaimGesture = useCallback((source: DragSource, gestureState: PanGestureState) => {
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
    }, [])

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
        if (config.placement === 'top') {
          panelHeight.setValue(nextHeight)
        } else {
          translation.setValue(getBottomTranslation(nextHeight, config.maxHeight))
        }
      },
      [panelHeight, setVisualHeight, translation],
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

    const headerResponder = usePanGesture({
      axis: 'vertical',
      shouldActivate: (gestureState) => shouldClaimGesture('header', gestureState),
      onStart: beginDrag,
      onChange: ({ distance }) => updateDrag(distance),
      onEnd: finishDrag,
    })

    const contentResponder = usePanGesture({
      axis: 'vertical',
      shouldActivate: (gestureState) => shouldClaimGesture('content', gestureState),
      onStart: beginDrag,
      onChange: ({ distance }) => updateDrag(distance),
      onEnd: finishDrag,
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
        translation.setValue(getBottomTranslation(nextHeight, maxHeight))
      }
      initializedRef.current = true
    }, [
      animateToHeight,
      height,
      maxHeight,
      minHeight,
      panelHeight,
      placement,
      setVisualHeight,
      translation,
    ])

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
      placement === 'top'
        ? { paddingTop: topInset }
        : { paddingBottom: Math.max(0, maxHeight - currentHeight) + bottomInset }
    const dragArea = header ?? <View style={[resolvedStyles.bar, semantic?.bar]} />
    const headerView =
      header !== undefined || draggable ? (
        <View {...headerResponder.panHandlers} style={[resolvedStyles.header, semantic?.header]}>
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
        style={[
          resolvedStyles.container,
          { height: placement === 'top' ? panelHeight : maxHeight },
          semantic?.container,
          placement === 'bottom' ? { transform: [{ translateY: translation }] } : null,
        ]}
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
