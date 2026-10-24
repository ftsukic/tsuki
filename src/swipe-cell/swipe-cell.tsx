import {
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { StyleSheet, View } from 'react-native'
import type { GestureResponderEvent, LayoutChangeEvent, PressableProps } from 'react-native'
import { GestureDetector, Gesture } from '../gesture'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import {
  resolveSwipeOffset,
  resolveSwipeTarget,
  snapSwipeCellOffset,
  SWIPE_PRESET,
} from '../motion/gesture'
import { useMotionConfig } from '../motion/useMotionConfig'
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets'
import { Pressable } from '../pressable'
import { useComponentToken } from '../theme'
import { resolveStyles } from '../style'
import { SwipeCellAction } from './swipe-cell-action'
import { SwipeCellPressFeedback } from './press-feedback'
import { SwipeCellActionMotion } from './swipe-cell-action-motion'
import {
  resolveActionProgress,
  resolveContentOffset,
  resolveContentMotionOffset,
  type SwipeCellContentMotion,
} from './action-offset'
import { getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import { SwipeCellGroupContext, SwipeCellPressContext } from './context'
import type {
  SwipeCellActionItem,
  SwipeCellActionProps,
  SwipeCellProps,
  SwipeCellRef,
  SwipeCellSide,
} from './types'

function isVisibleAction(action: ReactNode) {
  return action !== null && action !== undefined && action !== false
}

function getActionWidth(side: SwipeCellSide, widths: { left: number; right: number }) {
  return side === 'left' ? widths.left : widths.right
}

function getOffset(side: SwipeCellSide, width: number) {
  return side === 'left' ? width : -width
}

function wrapActionPress(
  onPress: PressableProps['onPress'],
  close: () => void,
  closeOnActionPress: boolean,
) {
  return (event: GestureResponderEvent) => {
    onPress?.(event)
    if (closeOnActionPress) close()
  }
}

function mergeActionPress(
  action: ReactNode,
  onPress: PressableProps['onPress'],
  close: () => void,
  closeOnActionPress: boolean,
): ReactNode {
  if (!isValidElement<SwipeCellActionProps>(action) || action.type !== SwipeCellAction) {
    return (
      <SwipeCellAction onPress={wrapActionPress(onPress, close, closeOnActionPress)}>
        {action}
      </SwipeCellAction>
    )
  }

  const actionOnPress = action.props.onPress
  return (
    <SwipeCellAction
      {...action.props}
      onPress={wrapActionPress(
        (event) => {
          actionOnPress?.(event)
          onPress?.(event)
        },
        close,
        closeOnActionPress,
      )}
    />
  )
}

function renderActionItems(
  actions: SwipeCellActionItem[],
  close: () => void,
  closeOnActionPress: boolean,
) {
  return actions.map((action, index) => (
    <SwipeCellAction
      key={action.key ?? index}
      color={action.color}
      backgroundColor={action.backgroundColor}
      textColor={action.textColor}
      width={action.width}
      disabled={action.disabled}
      onPress={wrapActionPress(action.onPress, close, closeOnActionPress)}
    >
      {action.text ?? action.label}
    </SwipeCellAction>
  ))
}

export const SwipeCell = forwardRef<SwipeCellRef, SwipeCellProps>(function SwipeCell(
  {
    id: explicitId,
    children,
    actions,
    leftActions,
    rightActions,
    leftAction,
    rightAction,
    onLeftActionPress,
    onRightActionPress,
    closeOnActionPress = true,
    overshoot = false,
    contentDragLimit,
    style,
    styles,
    onOpenStart,
    onOpen,
    onClose,
    testID,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('SwipeCell', getSwipeCellToken)
  const resolvedStyles = useMemo(() => getSwipeCellStyles(token), [token])
  const limitContent = contentDragLimit !== undefined && Number.isFinite(contentDragLimit)
  const contentLimit = limitContent ? Math.max(0, contentDragLimit) : 0
  const group = useContext(SwipeCellGroupContext)
  const generatedId = useId()
  const cellId = explicitId ?? generatedId
  const rootRef = useRef<View>(null)
  const translation = useSharedValue(0)
  const contentMotion = useSharedValue<SwipeCellContentMotion>({
    phase: 'idle',
    start: 0,
    target: 0,
    carry: 0,
  })
  const gestureStartX = useSharedValue(0)
  const gestureActive = useSharedValue(false)
  const gestureGeneration = useSharedValue(0)
  const gestureWidths = useSharedValue({ left: 0, right: 0 })
  const feedbackTouchStart = useSharedValue({ x: 0, y: 0 })
  const feedbackCancelled = useSharedValue(false)
  const feedbackOrigin = useRef<{ x: number; y: number } | null>(null)
  const contentFeedback = useRef(
    new SwipeCellPressFeedback(() => phaseRef.current === 'closed'),
  ).current
  const leftActionWidth = useSharedValue(0)
  const rightActionWidth = useSharedValue(0)
  const animationToken = useSharedValue(0)
  const mounted = useSharedValue(true)
  const currentOffsetRef = useRef(0)
  const actionWidthsRef = useRef({ left: 0, right: 0 })
  const pendingOpenRef = useRef<SwipeCellSide | null>(null)
  const openSideRef = useRef<SwipeCellSide | null>(null)
  const phaseRef = useRef<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const [actionSide, setActionSide] = useState<SwipeCellSide | null>(null)
  const hasLeftAction =
    leftActions !== undefined ? leftActions.length > 0 : isVisibleAction(leftAction)
  const resolvedRightActions = actions ?? rightActions
  const hasRightAction =
    resolvedRightActions !== undefined
      ? resolvedRightActions.length > 0
      : isVisibleAction(rightAction)
  const motion = useMotionConfig()
  const animationEnabled = motion.duration(token.animationDuration) > 0
  const durationScale = motion.durationScale

  const completeOpen = useCallback(
    (side: SwipeCellSide, offset: number, completionToken: number) => {
      if (animationToken.value !== completionToken) return
      currentOffsetRef.current = offset
      openSideRef.current = side
      phaseRef.current = 'open'
      setActionSide(side)
      onOpen?.()
    },
    [animationToken, onOpen],
  )

  const completeClose = useCallback(
    (completionToken: number) => {
      if (animationToken.value !== completionToken) return
      currentOffsetRef.current = 0
      openSideRef.current = null
      const wasOpen = phaseRef.current !== 'closed'
      phaseRef.current = 'closed'
      setActionSide(null)
      if (wasOpen) onClose?.()
    },
    [animationToken, onClose],
  )

  const prepareGestureSettlement = useCallback(
    (side: SwipeCellSide | null, gestureToken: number) => {
      if (animationToken.value !== gestureToken) return
      pendingOpenRef.current = null
      openSideRef.current = side
      if (side) phaseRef.current = 'opening'
      else if (phaseRef.current !== 'closed') phaseRef.current = 'closing'
    },
    [animationToken],
  )

  const settleOnUI = useCallback(
    (offset: number, side: SwipeCellSide | null, velocity?: number, fromGesture = false) => {
      'worklet'
      if (!mounted.value) return
      if (!fromGesture) gestureGeneration.value += 1
      gestureActive.value = false
      const nextToken = animationToken.value + 1
      animationToken.value = nextToken
      cancelAnimation(translation)
      const content = resolveContentMotionOffset(
        translation.value,
        leftActionWidth.value,
        rightActionWidth.value,
        limitContent ? contentLimit : undefined,
        contentMotion.value,
      )
      contentMotion.value = {
        phase: side ? 'opening' : 'closing',
        start: translation.value,
        target: offset,
        carry:
          content -
          resolveContentOffset(
            translation.value,
            leftActionWidth.value,
            rightActionWidth.value,
            limitContent ? contentLimit : undefined,
          ),
      }
      const completeSettlement = (finished?: boolean) => {
        'worklet'
        if (!finished || animationToken.value !== nextToken) return
        if (side) scheduleOnRN(completeOpen, side, offset, nextToken)
        else scheduleOnRN(completeClose, nextToken)
      }
      scheduleOnRN(prepareGestureSettlement, side, nextToken)
      translation.value = snapSwipeCellOffset(
        offset,
        animationEnabled,
        completeSettlement,
        durationScale,
        token.animationDuration,
        velocity,
        translation.value,
        limitContent,
      )
    },
    [
      animationEnabled,
      contentLimit,
      contentMotion,
      leftActionWidth,
      rightActionWidth,
      limitContent,
      animationToken,
      completeClose,
      completeOpen,
      durationScale,
      gestureActive,
      gestureGeneration,
      mounted,
      prepareGestureSettlement,
      token.animationDuration,
      translation,
    ],
  )

  const settleTo = useCallback(
    (offset: number, side: SwipeCellSide | null) => {
      setActionSide(null)
      if (side) contentFeedback.cancel()
      if (side) phaseRef.current = 'opening'
      else if (phaseRef.current !== 'closed') phaseRef.current = 'closing'
      scheduleOnUI(settleOnUI, offset, side, limitContent ? 0 : undefined)
    },
    [contentFeedback, limitContent, settleOnUI],
  )

  const syncOpenOffset = useCallback(
    (side: SwipeCellSide, width: number) => {
      if (openSideRef.current !== side || phaseRef.current === 'closed') return

      const nextToken = animationToken.value + 1
      animationToken.value = nextToken
      const nextOffset = getOffset(side, width)
      translation.value = nextOffset
      contentMotion.value = { phase: 'idle', start: nextOffset, target: nextOffset, carry: 0 }
      currentOffsetRef.current = nextOffset
    },
    [animationToken, contentMotion, translation],
  )

  const close = useCallback(() => {
    if (phaseRef.current === 'closing' && !gestureActive.value) return
    pendingOpenRef.current = null
    openSideRef.current = null
    setActionSide(null)
    settleTo(0, null)
  }, [gestureActive, settleTo])

  const resolveOpenSide = useCallback((side: SwipeCellSide) => {
    if (getActionWidth(side, actionWidthsRef.current) > 0) return side
    const fallback = side === 'left' ? 'right' : 'left'
    return getActionWidth(fallback, actionWidthsRef.current) > 0 ? fallback : null
  }, [])

  const notifyOpenStart = useCallback(() => {
    onOpenStart?.()
    group?.requestOpen(cellId)
  }, [cellId, group, onOpenStart])

  const open = useCallback(
    (side: SwipeCellSide = 'right') => {
      if (!hasLeftAction && !hasRightAction) {
        close()
        return
      }

      notifyOpenStart()
      const resolvedSide = resolveOpenSide(side)
      if (!resolvedSide) {
        pendingOpenRef.current = side
        return
      }

      pendingOpenRef.current = null
      openSideRef.current = resolvedSide
      settleTo(
        getOffset(resolvedSide, getActionWidth(resolvedSide, actionWidthsRef.current)),
        resolvedSide,
      )
    },
    [notifyOpenStart, close, hasLeftAction, hasRightAction, resolveOpenSide, settleTo],
  )

  const handleActionLayout = useCallback(
    (side: SwipeCellSide, event: LayoutChangeEvent) => {
      const width = Number.isFinite(event.nativeEvent.layout.width)
        ? Math.max(0, event.nativeEvent.layout.width)
        : 0
      actionWidthsRef.current[side] = width
      if (side === 'left') leftActionWidth.value = width
      else rightActionWidth.value = width

      // Layout updates change release bounds, never the active finger position.
      if (gestureActive.value) return

      if (pendingOpenRef.current === side && width > 0) {
        pendingOpenRef.current = null
        openSideRef.current = side
        settleTo(getOffset(side, width), side)
      } else if (phaseRef.current === 'opening' && openSideRef.current === side) {
        settleTo(getOffset(side, width), side)
      } else {
        syncOpenOffset(side, width)
      }
    },
    [gestureActive, leftActionWidth, rightActionWidth, settleTo, syncOpenOffset],
  )

  const cancelContentFeedback = useCallback(() => contentFeedback.move(), [contentFeedback])
  const endContentFeedback = useCallback(() => contentFeedback.end(), [contentFeedback])

  const startGesture = useCallback(
    (generation: number) => {
      if (!mounted.value || gestureGeneration.value !== generation) return
      contentFeedback.move()
      if (phaseRef.current === 'closing') phaseRef.current = 'open'
      setActionSide(null)
      notifyOpenStart()
    },
    [mounted, gestureGeneration, notifyOpenStart, contentFeedback],
  )

  const pan = useMemo(() => {
    const gesture = Gesture.Pan()
      .enabled(hasLeftAction || hasRightAction)
      .activeOffsetX([-SWIPE_PRESET.activationDistance, SWIPE_PRESET.activationDistance])
      .failOffsetY([-SWIPE_PRESET.activationDistance, SWIPE_PRESET.activationDistance])
      .onStart(() => {
        'worklet'
        gestureActive.value = true
        gestureWidths.value = { left: leftActionWidth.value, right: rightActionWidth.value }
        animationToken.value += 1
        gestureGeneration.value += 1
        cancelAnimation(translation)
        const content = resolveContentMotionOffset(
          translation.value,
          leftActionWidth.value,
          rightActionWidth.value,
          limitContent ? contentLimit : undefined,
          contentMotion.value,
        )
        contentMotion.value = {
          phase: 'dragging',
          start: translation.value,
          target: 0,
          carry:
            content -
            resolveContentOffset(
              translation.value,
              leftActionWidth.value,
              rightActionWidth.value,
              limitContent ? contentLimit : undefined,
            ),
        }
        gestureStartX.value = translation.value
        scheduleOnRN(startGesture, gestureGeneration.value)
      })
      .onUpdate((event) => {
        'worklet'
        if (!gestureActive.value) return
        translation.value = resolveSwipeOffset(
          gestureStartX.value + event.translationX,
          Math.max(gestureWidths.value.left, leftActionWidth.value),
          Math.max(gestureWidths.value.right, rightActionWidth.value),
          overshoot,
        )
      })
      .onEnd((event, success) => {
        'worklet'
        if (!gestureActive.value) return
        const offset = resolveSwipeOffset(
          gestureStartX.value + event.translationX,
          leftActionWidth.value,
          rightActionWidth.value,
          overshoot,
        )
        const targetOffset = resolveSwipeTarget(
          offset,
          event.velocityX,
          leftActionWidth.value,
          rightActionWidth.value,
        )
        const target = success ? targetOffset : 0
        const side: SwipeCellSide | null = target > 0 ? 'left' : target < 0 ? 'right' : null
        settleOnUI(target, side, success ? event.velocityX : 0, true)
      })
      .onFinalize(() => {
        'worklet'
        if (!gestureActive.value) return
        const target = resolveSwipeTarget(
          translation.value,
          0,
          leftActionWidth.value,
          rightActionWidth.value,
        )
        settleOnUI(target, target > 0 ? 'left' : target < 0 ? 'right' : null, 0, true)
      })

    if (testID) gesture.withTestId(`${testID}-gesture`)

    return gesture
  }, [
    animationToken,
    contentLimit,
    contentMotion,
    limitContent,
    startGesture,
    settleOnUI,
    gestureActive,
    gestureWidths,
    gestureGeneration,
    gestureStartX,
    hasLeftAction,
    hasRightAction,
    leftActionWidth,
    rightActionWidth,
    overshoot,
    testID,
    translation,
  ])

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: resolveContentMotionOffset(
          translation.value,
          leftActionWidth.value,
          rightActionWidth.value,
          limitContent ? contentLimit : undefined,
          contentMotion.value,
        ),
      },
    ],
  }))

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const side = translation.value < 0 ? 'right' : 'left'
    const width = side === 'right' ? rightActionWidth.value : leftActionWidth.value
    return { opacity: Math.min(1, resolveActionProgress(translation.value, width, side)) }
  })

  const handleContentPress = useCallback(() => {
    if (contentFeedback.moved) return true
    const dismiss = contentFeedback.dismissesPress || phaseRef.current !== 'closed'
    if (phaseRef.current === 'open' || phaseRef.current === 'opening') close()
    return dismiss
  }, [close, contentFeedback])

  const contentGesture = useMemo(() => {
    const cancelMovedFeedback = (x: number, y: number) => {
      'worklet'
      if (feedbackCancelled.value) return
      if (
        Math.abs(x - feedbackTouchStart.value.x) > SWIPE_PRESET.activationDistance ||
        Math.abs(y - feedbackTouchStart.value.y) > SWIPE_PRESET.activationDistance
      ) {
        feedbackCancelled.value = true
        scheduleOnRN(cancelContentFeedback)
      }
    }
    const tap = Gesture.Tap()
      .onTouchesDown((event) => {
        'worklet'
        const touch = event.allTouches[0]
        if (!touch) return
        feedbackTouchStart.value = { x: touch.absoluteX, y: touch.absoluteY }
        feedbackCancelled.value = false
      })
      .onTouchesMove((event) => {
        'worklet'
        const touch = event.allTouches[0]
        if (touch) cancelMovedFeedback(touch.absoluteX, touch.absoluteY)
      })
      .onFinalize((event) => {
        'worklet'
        // A tap can fail natively before delivering the move callback.
        cancelMovedFeedback(event.absoluteX, event.absoluteY)
      })
      .maxDistance(SWIPE_PRESET.activationDistance)
      .cancelsTouchesInView(false)
      .onEnd((_event, success) => {
        'worklet'
        if (success) scheduleOnRN(handleContentPress)
      })
    if (testID) tap.withTestId(`${testID}-tap`)
    return Gesture.Simultaneous(pan, tap)
  }, [
    cancelContentFeedback,
    feedbackCancelled,
    feedbackTouchStart,
    handleContentPress,
    pan,
    testID,
  ])

  useEffect(() => {
    if (!hasLeftAction) {
      const wasActive =
        openSideRef.current === 'left' ||
        pendingOpenRef.current === 'left' ||
        (phaseRef.current !== 'closed' && currentOffsetRef.current > 0)
      actionWidthsRef.current.left = 0
      leftActionWidth.value = 0
      if (pendingOpenRef.current === 'left') pendingOpenRef.current = null
      if (wasActive) close()
    }
    if (!hasRightAction) {
      const wasActive =
        openSideRef.current === 'right' ||
        pendingOpenRef.current === 'right' ||
        (phaseRef.current !== 'closed' && currentOffsetRef.current < 0)
      actionWidthsRef.current.right = 0
      rightActionWidth.value = 0
      if (pendingOpenRef.current === 'right') pendingOpenRef.current = null
      if (wasActive) close()
    }
  }, [close, hasLeftAction, hasRightAction, leftActionWidth, rightActionWidth])

  useEffect(() => {
    if (!group) return undefined
    return group.register(cellId, close)
  }, [cellId, close, group])

  useEffect(() => {
    mounted.value = true
    return () => {
      mounted.value = false
      animationToken.value += 1
      gestureGeneration.value += 1
      cancelAnimation(translation)
    }
  }, [animationToken, gestureGeneration, mounted, translation])

  useImperativeHandle(
    ref,
    () => ({ open, close, measure: (callback) => rootRef.current?.measure(callback) }),
    [close, open],
  )

  const renderedLeftActions =
    leftActions !== undefined
      ? renderActionItems(leftActions, close, closeOnActionPress)
      : mergeActionPress(leftAction, onLeftActionPress, close, closeOnActionPress)
  const renderedRightActions =
    resolvedRightActions !== undefined
      ? renderActionItems(resolvedRightActions, close, closeOnActionPress)
      : mergeActionPress(rightAction, onRightActionPress, close, closeOnActionPress)

  const semantic = resolveStyles(styles, {
    props: {
      ...viewProps,
      id: explicitId,
      children,
      actions,
      leftActions,
      rightActions,
      leftAction,
      rightAction,
      onLeftActionPress,
      onRightActionPress,
      closeOnActionPress,
      overshoot,
      contentDragLimit,
      style,
      styles,
      onOpenStart,
      onOpen,
      onClose,
      testID,
    },
    state: { left: hasLeftAction, right: hasRightAction },
  })

  const actionOwner = useMemo(() => ({}), [])
  const contentOwner = useMemo(
    () => ({
      onPress: handleContentPress,
      feedback: contentFeedback,
    }),
    [contentFeedback, handleContentPress],
  )

  const renderedContent = (
    <SwipeCellPressContext.Provider value={contentOwner}>
      <GestureDetector gesture={contentGesture}>
        <Animated.View
          accessible={false}
          testID={testID ? `${testID}-motion` : undefined}
          style={animatedContentStyle}
        >
          <Pressable
            accessible={false}
            onStartShouldSetResponderCapture={() => phaseRef.current !== 'closed'}
            onTouchStart={(event) => {
              const x = event.nativeEvent?.pageX
              const y = event.nativeEvent?.pageY
              feedbackOrigin.current = Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
              contentFeedback.begin()
            }}
            onTouchMove={(event) => {
              const origin = feedbackOrigin.current
              if (!origin) return
              if (
                Math.abs(event.nativeEvent.pageX - origin.x) > SWIPE_PRESET.activationDistance ||
                Math.abs(event.nativeEvent.pageY - origin.y) > SWIPE_PRESET.activationDistance
              ) {
                contentFeedback.move()
              }
            }}
            onTouchEnd={endContentFeedback}
            onTouchCancel={endContentFeedback}
            onPress={handleContentPress}
            onLongPress={handleContentPress}
            style={[resolvedStyles.content, semantic?.content]}
            pressStyle="background"
            pressedBackgroundColor={token.pressedBackgroundColor}
            testID={testID ? `${testID}-content` : undefined}
          >
            {children}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </SwipeCellPressContext.Provider>
  )

  return (
    <View
      {...viewProps}
      ref={rootRef}
      collapsable={false}
      testID={testID}
      style={[resolvedStyles.root, semantic?.root, style]}
    >
      <SwipeCellPressContext.Provider value={actionOwner}>
        <View
          pointerEvents="box-none"
          style={[resolvedStyles.actions, limitContent && { zIndex: 1 }, semantic?.actions]}
        >
          {hasLeftAction ? (
            <View
              testID={testID ? `${testID}-left-action` : undefined}
              pointerEvents={actionSide === 'left' ? 'auto' : 'none'}
              accessibilityElementsHidden={actionSide !== 'left'}
              importantForAccessibility={actionSide === 'left' ? 'auto' : 'no-hide-descendants'}
              onLayout={(event) => handleActionLayout('left', event)}
              style={resolvedStyles.actionSlot}
            >
              {(Array.isArray(renderedLeftActions)
                ? renderedLeftActions
                : [renderedLeftActions]
              ).map((action, index) => (
                <SwipeCellActionMotion
                  key={isValidElement(action) ? (action.key ?? index) : index}
                  side="left"
                  layer={
                    (Array.isArray(renderedLeftActions) ? renderedLeftActions.length : 1) - index
                  }
                  translation={translation}
                  totalWidth={leftActionWidth}
                >
                  {action}
                </SwipeCellActionMotion>
              ))}
            </View>
          ) : null}
          <View pointerEvents="none" style={{ flex: 1 }} />
          {hasRightAction ? (
            <View
              testID={testID ? `${testID}-right-action` : undefined}
              pointerEvents={actionSide === 'right' ? 'auto' : 'none'}
              accessibilityElementsHidden={actionSide !== 'right'}
              importantForAccessibility={actionSide === 'right' ? 'auto' : 'no-hide-descendants'}
              onLayout={(event) => handleActionLayout('right', event)}
              style={resolvedStyles.actionSlot}
            >
              {(Array.isArray(renderedRightActions)
                ? renderedRightActions
                : [renderedRightActions]
              ).map((action, index) => (
                <SwipeCellActionMotion
                  key={isValidElement(action) ? (action.key ?? index) : index}
                  side="right"
                  layer={index + 1}
                  translation={translation}
                  totalWidth={rightActionWidth}
                >
                  {action}
                </SwipeCellActionMotion>
              ))}
            </View>
          ) : null}
        </View>
      </SwipeCellPressContext.Provider>
      {renderedContent}
      {limitContent ? (
        <Animated.View
          testID={testID ? `${testID}-content-overlay` : undefined}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: token.contentOverlayColor },
            semantic?.contentOverlay,
            animatedOverlayStyle,
          ]}
        />
      ) : null}
    </View>
  )
})

SwipeCell.displayName = 'SwipeCell'
