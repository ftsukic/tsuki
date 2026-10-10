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
  type ReactNode,
} from 'react'
import { View } from 'react-native'
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
  snapGesture,
  SWIPE_PRESET,
} from '../motion/gesture'
import { useMotionConfig } from '../motion/useMotionConfig'
import { scheduleOnRN } from 'react-native-worklets'
import { useInteraction } from '../interaction'
import { getCellToken } from '../cell/token'
import { Pressable } from '../pressable'
import { useComponentToken } from '../theme'
import { SwipeCellAction } from './swipe-cell-action'
import { getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import { SwipeCellGroupContext, useSwipeCellManager } from './context'
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
  interactionId: string,
): ReactNode {
  if (!isValidElement<SwipeCellActionProps>(action) || action.type !== SwipeCellAction) {
    return (
      <SwipeCellAction
        interactionId={interactionId}
        onPress={wrapActionPress(onPress, close, closeOnActionPress)}
      >
        {action}
      </SwipeCellAction>
    )
  }

  const actionOnPress = action.props.onPress
  return (
    <SwipeCellAction
      {...action.props}
      interactionId={interactionId}
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
  interactionId: string,
) {
  return actions.map((action, index) => (
    <SwipeCellAction
      key={action.key ?? index}
      interactionId={interactionId}
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
    style,
    contentStyle,
    actionStyle,
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
  const interaction = useInteraction()
  const generatedId = useId()
  const cellId = explicitId ?? generatedId
  const translation = useSharedValue(0)
  const gestureStartX = useSharedValue(0)
  const leftActionWidth = useSharedValue(0)
  const rightActionWidth = useSharedValue(0)
  const animationToken = useSharedValue(0)
  const currentOffsetRef = useRef(0)
  const actionWidthsRef = useRef({ left: 0, right: 0 })
  const pendingOpenRef = useRef<SwipeCellSide | null>(null)
  const openSideRef = useRef<SwipeCellSide | null>(null)
  const phaseRef = useRef<'closed' | 'opening' | 'open' | 'closing'>('closed')
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
      manager?.release(cellId)
      interaction.clear(cellId)
      if (wasOpen) onClose?.()
    },
    [animationToken, cellId, interaction, manager, onClose],
  )

  const settleTo = useCallback(
    (offset: number, side: SwipeCellSide | null) => {
      const nextToken = animationToken.value + 1
      animationToken.value = nextToken

      if (!animationEnabled) {
        translation.value = offset
        if (side) completeOpen(side, offset, nextToken)
        else completeClose(nextToken)
        return
      }

      if (side) phaseRef.current = 'opening'
      else phaseRef.current = 'closing'

      translation.value = snapGesture(
        offset,
        animationEnabled,
        (finished) => {
          'worklet'
          if (!finished || animationToken.value !== nextToken) return
          if (side) scheduleOnRN(completeOpen, side, offset, nextToken)
          else scheduleOnRN(completeClose, nextToken)
        },
        durationScale,
      )
    },
    [animationEnabled, animationToken, completeClose, completeOpen, durationScale, translation],
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

  const releaseOrClear = useCallback(() => {
    manager?.release(cellId)
    interaction.clear(cellId)
  }, [cellId, interaction, manager])

  const close = useCallback(() => {
    pendingOpenRef.current = null
    openSideRef.current = null
    settleTo(0, null)
  }, [settleTo])

  const resolveOpenSide = useCallback((side: SwipeCellSide) => {
    if (getActionWidth(side, actionWidthsRef.current) > 0) return side
    const fallback = side === 'left' ? 'right' : 'left'
    return getActionWidth(fallback, actionWidthsRef.current) > 0 ? fallback : null
  }, [])

  const handle = useMemo<SwipeCellHandle>(() => ({ id: cellId, close }), [cellId, close])

  const claim = useCallback(() => {
    if (manager) manager.claim(handle)
    else interaction.requestOpen(cellId, close)
  }, [cellId, close, handle, interaction, manager])

  const open = useCallback(
    (side: SwipeCellSide = 'right') => {
      if (!hasLeftAction && !hasRightAction) {
        close()
        return
      }

      claim()
      group?.requestOpen(cellId)
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
    [cellId, claim, close, group, hasLeftAction, hasRightAction, resolveOpenSide, settleTo],
  )

  const handleActionLayout = useCallback(
    (side: SwipeCellSide, event: LayoutChangeEvent) => {
      const width = Number.isFinite(event.nativeEvent.layout.width)
        ? Math.max(0, event.nativeEvent.layout.width)
        : 0
      actionWidthsRef.current[side] = width
      if (side === 'left') leftActionWidth.value = width
      else rightActionWidth.value = width

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
    [leftActionWidth, rightActionWidth, settleTo, syncOpenOffset],
  )

  const pan = useMemo(() => {
    const gesture = Gesture.Pan()
      .enabled(hasLeftAction || hasRightAction)
      .activeOffsetX([-SWIPE_PRESET.activationDistance, SWIPE_PRESET.activationDistance])
      .failOffsetY([-SWIPE_PRESET.activationDistance, SWIPE_PRESET.activationDistance])
      .onStart(() => {
        'worklet'
        animationToken.value += 1
        cancelAnimation(translation)
        gestureStartX.value = translation.value
        scheduleOnRN(claim)
      })
      .onUpdate((event) => {
        'worklet'
        translation.value = resolveSwipeOffset(
          gestureStartX.value + event.translationX,
          leftActionWidth.value,
          rightActionWidth.value,
          overshoot,
        )
      })
      .onEnd((event, success) => {
        'worklet'
        const offset = gestureStartX.value + event.translationX
        const targetOffset = resolveSwipeTarget(
          offset,
          event.velocityX,
          leftActionWidth.value,
          rightActionWidth.value,
        )
        const openingLeft = targetOffset > 0
        const openingRight = targetOffset < 0

        if (!success || (!openingLeft && !openingRight)) {
          animationToken.value += 1
          const nextToken = animationToken.value
          if (!animationEnabled) {
            translation.value = 0
            scheduleOnRN(completeClose, nextToken)
          } else {
            translation.value = snapGesture(
              0,
              animationEnabled,
              (finished) => {
                'worklet'
                if (finished && animationToken.value === nextToken)
                  scheduleOnRN(completeClose, nextToken)
              },
              durationScale,
            )
          }
          return
        }

        const side: SwipeCellSide = openingLeft ? 'left' : 'right'
        const target = side === 'left' ? leftActionWidth.value : -rightActionWidth.value
        animationToken.value += 1
        const nextToken = animationToken.value
        if (!animationEnabled) {
          translation.value = target
          scheduleOnRN(completeOpen, side, target, nextToken)
        } else {
          translation.value = snapGesture(
            target,
            animationEnabled,
            (finished) => {
              'worklet'
              if (finished && animationToken.value === nextToken) {
                scheduleOnRN(completeOpen, side, target, nextToken)
              }
            },
            durationScale,
          )
        }
      })

    if (testID) gesture.withTestId(`${testID}-gesture`)

    return gesture
  }, [
    animationEnabled,
    animationToken,
    durationScale,
    claim,
    completeClose,
    completeOpen,
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
    if (phaseRef.current !== 'closed') {
      close()
      return
    }
    if (manager) manager.closeOthers(cellId)
    else interaction.notifyPress(cellId)
  }, [cellId, close, interaction, manager])

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
    return () => {
      animationToken.value += 1
      releaseOrClear()
    }
  }, [animationToken, releaseOrClear])

  useImperativeHandle(ref, () => ({ open, close }), [close, open])

  const renderedLeftActions =
    leftActions !== undefined
      ? renderActionItems(leftActions, close, closeOnActionPress, cellId)
      : mergeActionPress(leftAction, onLeftActionPress, close, closeOnActionPress, cellId)
  const renderedRightActions =
    resolvedRightActions !== undefined
      ? renderActionItems(resolvedRightActions, close, closeOnActionPress, cellId)
      : mergeActionPress(rightAction, onRightActionPress, close, closeOnActionPress, cellId)

  const renderedContent = (
    <GestureDetector gesture={pan}>
      <Animated.View
        onTouchStart={handleContentPressIn}
        testID={testID ? `${testID}-content` : undefined}
        style={[resolvedStyles.content, contentStyle, animatedContentStyle]}
      >
        <Pressable
          interactionId={cellId}
          onPressIn={handleContentPressIn}
          onPress={close}
          pressStyle="background"
          pressedBackgroundColor={cellToken.pressedBackgroundColor}
          testID={testID ? `${testID}-pressable` : undefined}
        >
          {children}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  )

  return (
    <View {...viewProps} testID={testID} style={[resolvedStyles.root, style]}>
      <View pointerEvents="box-none" style={[resolvedStyles.actions, actionStyle]}>
        {hasLeftAction ? (
          <View
            testID={testID ? `${testID}-left-action` : undefined}
            onLayout={(event) => handleActionLayout('left', event)}
            style={resolvedStyles.actionSlot}
          >
            {renderedLeftActions}
          </View>
        ) : null}
        <View style={{ flex: 1 }} />
        {hasRightAction ? (
          <View
            testID={testID ? `${testID}-right-action` : undefined}
            onLayout={(event) => handleActionLayout('right', event)}
            style={resolvedStyles.actionSlot}
          >
            {renderedRightActions}
          </View>
        ) : null}
      </View>
      {renderedContent}
    </View>
  )
})

SwipeCell.displayName = 'SwipeCell'

export function useSwipeCellController() {
  const manager = useSwipeCellManager()
  const interaction = useInteraction()
  const closeCurrent = useCallback(() => {
    if (manager) manager.closeActive()
    else interaction.closeCurrent()
  }, [interaction, manager])
  return useMemo(
    () => ({
      closeCurrent,
      closeCurrentSwipeCell: closeCurrent,
    }),
    [closeCurrent],
  )
}
