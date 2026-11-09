import {
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Platform, View } from 'react-native'
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
import { getCellToken } from '../cell/token'
import { Pressable } from '../pressable'
import { useComponentToken } from '../theme'
import { resolveStyles } from '../style'
import { SwipeCellAction } from './swipe-cell-action'
import { SwipeCellPressFeedback } from './press-feedback'
import { SwipeCellActionMotion } from './swipe-cell-action-motion'
import { getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import { SwipeCellGroupContext, SwipeCellPressContext, useSwipeCellManager } from './context'
import type { SwipeCellHandle } from './manager'
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
  isCurrentBinding: () => boolean,
) {
  return (event: GestureResponderEvent) => {
    if (!isCurrentBinding()) return
    onPress?.(event)
    if (closeOnActionPress) close()
  }
}

function mergeActionPress(
  action: ReactNode,
  onPress: PressableProps['onPress'],
  close: () => void,
  closeOnActionPress: boolean,
  isCurrentBinding: () => boolean,
): ReactNode {
  if (!isValidElement<SwipeCellActionProps>(action) || action.type !== SwipeCellAction) {
    return (
      <SwipeCellAction
        onPress={wrapActionPress(onPress, close, closeOnActionPress, isCurrentBinding)}
      >
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
          if (!isCurrentBinding()) return
          actionOnPress?.(event)
          onPress?.(event)
        },
        close,
        closeOnActionPress,
        isCurrentBinding,
      )}
    />
  )
}

function renderActionItems(
  actions: SwipeCellActionItem[],
  close: () => void,
  closeOnActionPress: boolean,
  isCurrentBinding: () => boolean,
) {
  return actions.map((action, index) => (
    <SwipeCellAction
      key={action.key ?? index}
      color={action.color}
      backgroundColor={action.backgroundColor}
      textColor={action.textColor}
      width={action.width}
      disabled={action.disabled}
      onPress={wrapActionPress(action.onPress, close, closeOnActionPress, isCurrentBinding)}
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
    style,
    styles,
    onOpen,
    onClose,
    testID,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('SwipeCell', getSwipeCellToken)
  const cellToken = useComponentToken('Cell', getCellToken)
  const resolvedStyles = useMemo(() => getSwipeCellStyles(token), [token])
  const group = useContext(SwipeCellGroupContext)
  const manager = useSwipeCellManager()
  const generatedId = useId()
  const cellId = explicitId ?? generatedId
  const currentCellIdRef = useRef(cellId)
  const bindingGenerationRef = useRef(0)
  const translation = useSharedValue(0)
  const gestureStartX = useSharedValue(0)
  const gestureActive = useSharedValue(false)
  const gestureWidths = useSharedValue({ left: 0, right: 0 })
  const feedbackTouchStart = useSharedValue({ x: 0, y: 0 })
  const feedbackCancelled = useSharedValue(false)
  const contentFeedback = useRef(new SwipeCellPressFeedback()).current
  const leftActionWidth = useSharedValue(0)
  const rightActionWidth = useSharedValue(0)
  const animationToken = useSharedValue(0)
  const bindingGeneration = useSharedValue(0)
  const gestureBinding = useSharedValue(0)
  const mounted = useSharedValue(true)
  const currentOffsetRef = useRef(0)
  const actionWidthsRef = useRef({ left: 0, right: 0 })
  const currentCloseRef = useRef<() => void>(() => {})
  const handleRef = useRef<SwipeCellHandle>({
    id: cellId,
    close: () => {
      if (currentCellIdRef.current === cellId) currentCloseRef.current()
    },
  })
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

  useLayoutEffect(() => {
    const previousCellId = currentCellIdRef.current
    if (previousCellId === cellId) return

    currentCellIdRef.current = cellId
    const nextBindingGeneration = bindingGenerationRef.current + 1
    bindingGenerationRef.current = nextBindingGeneration
    bindingGeneration.value = nextBindingGeneration
    animationToken.value += 1
    cancelAnimation(translation)
    translation.value = 0
    gestureActive.value = false
    gestureWidths.value = { left: 0, right: 0 }
    actionWidthsRef.current = { left: 0, right: 0 }
    leftActionWidth.value = 0
    rightActionWidth.value = 0
    contentFeedback.cancel()
    pendingOpenRef.current = null
    openSideRef.current = null
    phaseRef.current = 'closed'
    currentOffsetRef.current = 0
    setActionSide(null)
    manager?.release(previousCellId)
    group?.release(handleRef.current)
    handleRef.current = {
      id: cellId,
      close: () => {
        if (currentCellIdRef.current === cellId) currentCloseRef.current()
      },
    }
  }, [
    animationToken,
    bindingGeneration,
    cellId,
    contentFeedback,
    gestureActive,
    gestureWidths,
    group,
    leftActionWidth,
    manager,
    rightActionWidth,
    translation,
  ])

  const isCurrentBinding = useCallback(() => currentCellIdRef.current === cellId, [cellId])

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
      manager?.release(cellId)
      group?.release(handleRef.current)
      if (wasOpen) onClose?.()
    },
    [animationToken, cellId, group, manager, onClose],
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
    (offset: number, side: SwipeCellSide | null, expectedBindingGeneration: number) => {
      'worklet'
      if (!mounted.value || bindingGeneration.value !== expectedBindingGeneration) return
      gestureActive.value = false
      const nextToken = animationToken.value + 1
      animationToken.value = nextToken
      cancelAnimation(translation)
      scheduleOnRN(prepareGestureSettlement, side, nextToken)
      translation.value = snapSwipeCellOffset(
        offset,
        animationEnabled,
        (finished) => {
          'worklet'
          if (!finished || animationToken.value !== nextToken) return
          if (side) scheduleOnRN(completeOpen, side, offset, nextToken)
          else scheduleOnRN(completeClose, nextToken)
        },
        durationScale,
        token.animationDuration,
      )
    },
    [
      animationEnabled,
      animationToken,
      bindingGeneration,
      completeClose,
      completeOpen,
      durationScale,
      gestureActive,
      mounted,
      prepareGestureSettlement,
      token.animationDuration,
      translation,
    ],
  )

  const settleTo = useCallback(
    (offset: number, side: SwipeCellSide | null) => {
      if (currentCellIdRef.current !== cellId) return
      setActionSide(null)
      if (side) phaseRef.current = 'opening'
      else if (phaseRef.current !== 'closed') phaseRef.current = 'closing'
      scheduleOnUI(settleOnUI, offset, side, bindingGenerationRef.current)
    },
    [cellId, settleOnUI],
  )

  const syncOpenOffset = useCallback(
    (side: SwipeCellSide, width: number) => {
      if (openSideRef.current !== side || phaseRef.current === 'closed') return

      const nextToken = animationToken.value + 1
      animationToken.value = nextToken
      const nextOffset = getOffset(side, width)
      translation.value = nextOffset
      currentOffsetRef.current = nextOffset
    },
    [animationToken, translation],
  )

  const releaseOwnership = useCallback(() => {
    manager?.release(cellId)
  }, [cellId, manager])

  const close = useCallback(() => {
    if (currentCellIdRef.current !== cellId) return
    if (phaseRef.current === 'closing') return
    if (
      phaseRef.current === 'closed' &&
      pendingOpenRef.current === null &&
      !gestureActive.value &&
      currentOffsetRef.current === 0
    ) {
      manager?.release(cellId)
      group?.release(handleRef.current)
      return
    }
    pendingOpenRef.current = null
    openSideRef.current = null
    setActionSide(null)
    settleTo(0, null)
  }, [cellId, gestureActive, group, manager, settleTo])

  const resolveOpenSide = useCallback((side: SwipeCellSide) => {
    if (getActionWidth(side, actionWidthsRef.current) > 0) return side
    const fallback = side === 'left' ? 'right' : 'left'
    return getActionWidth(fallback, actionWidthsRef.current) > 0 ? fallback : null
  }, [])

  const claim = useCallback(() => {
    const handle = handleRef.current
    manager?.claim(handle)
    group?.requestOpen(handle)
  }, [group, manager])

  const open = useCallback(
    (side: SwipeCellSide = 'right') => {
      if (currentCellIdRef.current !== cellId) return
      if (!hasLeftAction && !hasRightAction) {
        close()
        return
      }

      claim()
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
    [cellId, claim, close, hasLeftAction, hasRightAction, resolveOpenSide, settleTo],
  )

  const handleActionLayout = useCallback(
    (side: SwipeCellSide, event: LayoutChangeEvent) => {
      if (currentCellIdRef.current !== cellId) return
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
    [cellId, gestureActive, leftActionWidth, rightActionWidth, settleTo, syncOpenOffset],
  )

  const cancelContentFeedback = useCallback(() => contentFeedback.cancel(), [contentFeedback])
  const endContentFeedback = useCallback(() => contentFeedback.end(), [contentFeedback])

  const startGesture = useCallback(
    (expectedBindingGeneration: number) => {
      if (expectedBindingGeneration !== bindingGenerationRef.current) return
      contentFeedback.cancel()
      if (phaseRef.current === 'closing') phaseRef.current = 'open'
      setActionSide(null)
      claim()
    },
    [claim, contentFeedback],
  )

  const pan = useMemo(() => {
    const gesture = Gesture.Pan()
      .enabled(hasLeftAction || hasRightAction)
      .activeOffsetX([-SWIPE_PRESET.activationDistance, SWIPE_PRESET.activationDistance])
      .failOffsetY([-SWIPE_PRESET.activationDistance, SWIPE_PRESET.activationDistance])
      .onStart(() => {
        'worklet'
        const currentBinding = bindingGeneration.value
        gestureBinding.value = currentBinding
        gestureActive.value = true
        gestureWidths.value = { left: leftActionWidth.value, right: rightActionWidth.value }
        animationToken.value += 1
        cancelAnimation(translation)
        gestureStartX.value = translation.value
        scheduleOnRN(startGesture, currentBinding)
      })
      .onUpdate((event) => {
        'worklet'
        if (gestureBinding.value !== bindingGeneration.value) return
        translation.value = resolveSwipeOffset(
          gestureStartX.value + event.translationX,
          Math.max(gestureWidths.value.left, leftActionWidth.value),
          Math.max(gestureWidths.value.right, rightActionWidth.value),
          overshoot,
        )
      })
      .onEnd((event, success) => {
        'worklet'
        if (gestureBinding.value !== bindingGeneration.value) {
          gestureActive.value = false
          return
        }
        const offset = gestureStartX.value + event.translationX
        const targetOffset = resolveSwipeTarget(
          offset,
          event.velocityX,
          leftActionWidth.value,
          rightActionWidth.value,
        )
        const target = success ? targetOffset : 0
        const side: SwipeCellSide | null = target > 0 ? 'left' : target < 0 ? 'right' : null
        settleOnUI(target, side, gestureBinding.value)
      })

    if (testID) gesture.withTestId(`${testID}-gesture`)

    return gesture
  }, [
    animationToken,
    bindingGeneration,
    startGesture,
    settleOnUI,
    gestureActive,
    gestureBinding,
    gestureWidths,
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
    transform: [{ translateX: translation.value }],
  }))

  const handleContentPressIn = useCallback(() => {
    if (currentCellIdRef.current !== cellId) return
    manager?.closeOthers(cellId)
  }, [cellId, manager])

  const handleContentPress = useCallback(() => {
    if (currentCellIdRef.current !== cellId) return
    if (phaseRef.current === 'open' || phaseRef.current === 'opening') close()
  }, [cellId, close])

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

  useLayoutEffect(() => {
    currentCloseRef.current = close
  }, [close])

  useLayoutEffect(() => {
    const handle = handleRef.current
    return () => group?.release(handle)
  }, [cellId, group])

  useEffect(() => {
    mounted.value = true
    return () => {
      mounted.value = false
      animationToken.value += 1
      cancelAnimation(translation)
      releaseOwnership()
    }
  }, [animationToken, mounted, releaseOwnership, translation])

  useImperativeHandle(ref, () => ({ open, close }), [close, open])

  const renderedLeftActions =
    leftActions !== undefined
      ? renderActionItems(leftActions, close, closeOnActionPress, isCurrentBinding)
      : mergeActionPress(leftAction, onLeftActionPress, close, closeOnActionPress, isCurrentBinding)
  const renderedRightActions =
    resolvedRightActions !== undefined
      ? renderActionItems(resolvedRightActions, close, closeOnActionPress, isCurrentBinding)
      : mergeActionPress(
          rightAction,
          onRightActionPress,
          close,
          closeOnActionPress,
          isCurrentBinding,
        )

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
      style,
      styles,
      onOpen,
      onClose,
      testID,
    },
    state: { left: hasLeftAction, right: hasRightAction },
  })

  const actionOwner = useMemo(() => ({ id: cellId }), [cellId])
  const contentOwner = useMemo(
    () => ({
      id: cellId,
      onPressIn: handleContentPressIn,
      onPress: handleContentPress,
      feedback: contentFeedback,
    }),
    [cellId, contentFeedback, handleContentPressIn, handleContentPress],
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
            onTouchStart={() => {
              contentFeedback.begin()
              handleContentPressIn()
            }}
            onTouchEnd={endContentFeedback}
            onTouchCancel={endContentFeedback}
            onPress={handleContentPress}
            style={[resolvedStyles.content, semantic?.content]}
            pressStyle="background"
            pressedBackgroundColor={cellToken.pressedBackgroundColor}
            testID={testID ? `${testID}-content` : undefined}
          >
            {children}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </SwipeCellPressContext.Provider>
  )

  return (
    <View {...viewProps} testID={testID} style={[resolvedStyles.root, semantic?.root, style]}>
      <SwipeCellPressContext.Provider value={actionOwner}>
        <View pointerEvents="box-none" style={[resolvedStyles.actions, semantic?.actions]}>
          {hasLeftAction ? (
            <View
              id={
                Platform.OS === 'web'
                  ? `tsuki-swipe-cell-action-${encodeURIComponent(cellId)}-left`
                  : undefined
              }
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
              ).map((action, index, items) => (
                <SwipeCellActionMotion
                  key={isValidElement(action) ? (action.key ?? index) : index}
                  side="left"
                  translation={translation}
                  totalWidth={leftActionWidth}
                  layer={items.length - index}
                >
                  {action}
                </SwipeCellActionMotion>
              ))}
            </View>
          ) : null}
          <View style={{ flex: 1 }} />
          {hasRightAction ? (
            <View
              id={
                Platform.OS === 'web'
                  ? `tsuki-swipe-cell-action-${encodeURIComponent(cellId)}-right`
                  : undefined
              }
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
                  translation={translation}
                  totalWidth={rightActionWidth}
                  layer={index + 1}
                >
                  {action}
                </SwipeCellActionMotion>
              ))}
            </View>
          ) : null}
        </View>
      </SwipeCellPressContext.Provider>
      {renderedContent}
    </View>
  )
})

SwipeCell.displayName = 'SwipeCell'

export function useSwipeCellController() {
  const manager = useSwipeCellManager()
  const group = useContext(SwipeCellGroupContext)
  const closeCurrent = useCallback(() => {
    if (group) group.closeCurrent()
    else manager?.closeActive()
  }, [group, manager])
  return useMemo(
    () => ({
      closeCurrent,
      closeCurrentSwipeCell: closeCurrent,
    }),
    [closeCurrent],
  )
}
