import {
  createContext,
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
import { Animated, useAnimatedStyle, useSharedValue, withSpring } from '../animation'
import { scheduleOnRN } from 'react-native-worklets'
import { useInteraction } from '../interaction'
import { getCellInteractionStyle } from '../cell/style'
import { getCellToken } from '../cell/token'
import { Pressable } from '../pressable'
import { useComponentToken, useToken } from '../theme'
import { SwipeCellAction } from './swipe-cell-action'
import { getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import { useSwipeCellManager } from './context'
import type { SwipeCellHandle } from './manager'
import type {
  SwipeCellActionItem,
  SwipeCellActionProps,
  SwipeCellGroupProps,
  SwipeCellProps,
  SwipeCellRef,
  SwipeCellSide,
} from './types'

interface SwipeCellGroupContextValue {
  register: (id: string, close: () => void) => () => void
  requestOpen: (id: string) => void
}

const SwipeCellGroupContext = createContext<SwipeCellGroupContextValue | null>(null)

const SWIPE_DISTANCE = 4
const SWIPE_VELOCITY = 500

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
  const { token: themeToken } = useToken()
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
  const animationTokenRef = useRef(0)
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
  const animationEnabled = themeToken.motion && token.animationDuration > 0

  const completeOpen = useCallback(
    (side: SwipeCellSide, offset: number) => {
      currentOffsetRef.current = offset
      openSideRef.current = side
      phaseRef.current = 'open'
      onOpen?.()
    },
    [onOpen],
  )

  const completeClose = useCallback(() => {
    currentOffsetRef.current = 0
    openSideRef.current = null
    const wasOpen = phaseRef.current !== 'closed'
    phaseRef.current = 'closed'
    manager?.release(cellId)
    interaction.clear(cellId)
    if (wasOpen) onClose?.()
  }, [cellId, interaction, manager, onClose])

  const settleTo = useCallback(
    (offset: number, side: SwipeCellSide | null) => {
      const nextToken = animationTokenRef.current + 1
      animationTokenRef.current = nextToken
      animationToken.value = nextToken

      if (!animationEnabled) {
        translation.value = offset
        if (side) completeOpen(side, offset)
        else completeClose()
        return
      }

      if (side) phaseRef.current = 'opening'
      else phaseRef.current = 'closing'

      translation.value = withSpring(offset, undefined, (finished) => {
        'worklet'
        if (!finished || animationToken.value !== nextToken) return
        if (side) scheduleOnRN(completeOpen, side, offset)
        else scheduleOnRN(completeClose)
      })
    },
    [animationEnabled, animationToken, completeClose, completeOpen, translation],
  )

  const syncOpenOffset = useCallback(
    (side: SwipeCellSide, width: number) => {
      if (openSideRef.current !== side || phaseRef.current === 'closed') return

      const nextToken = animationTokenRef.current + 1
      animationTokenRef.current = nextToken
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
      .activeOffsetX([-SWIPE_DISTANCE, SWIPE_DISTANCE])
      .failOffsetY([-SWIPE_DISTANCE, SWIPE_DISTANCE])
      .onStart(() => {
        'worklet'
        animationToken.value += 1
        gestureStartX.value = translation.value
        scheduleOnRN(claim)
      })
      .onUpdate((event) => {
        'worklet'
        const minimum = -rightActionWidth.value
        const maximum = leftActionWidth.value
        translation.value = Math.min(
          maximum,
          Math.max(minimum, gestureStartX.value + event.translationX),
        )
      })
      .onEnd((event, success) => {
        'worklet'
        const minimum = -rightActionWidth.value
        const maximum = leftActionWidth.value
        const offset = Math.min(
          maximum,
          Math.max(minimum, gestureStartX.value + event.translationX),
        )
        const openingLeft =
          offset > 0 && (offset > leftActionWidth.value / 2 || event.velocityX >= SWIPE_VELOCITY)
        const openingRight =
          offset < 0 &&
          (Math.abs(offset) > rightActionWidth.value / 2 || event.velocityX <= -SWIPE_VELOCITY)

        if (!success || (!openingLeft && !openingRight)) {
          animationToken.value += 1
          const nextToken = animationToken.value
          if (!animationEnabled) {
            translation.value = 0
            scheduleOnRN(completeClose)
          } else {
            translation.value = withSpring(0, undefined, (finished) => {
              'worklet'
              if (finished && animationToken.value === nextToken) scheduleOnRN(completeClose)
            })
          }
          return
        }

        const side: SwipeCellSide = openingLeft ? 'left' : 'right'
        const target = side === 'left' ? leftActionWidth.value : -rightActionWidth.value
        animationToken.value += 1
        const nextToken = animationToken.value
        if (!animationEnabled) {
          translation.value = target
          scheduleOnRN(completeOpen, side, target)
        } else {
          translation.value = withSpring(target, undefined, (finished) => {
            'worklet'
            if (finished && animationToken.value === nextToken) {
              scheduleOnRN(completeOpen, side, target)
            }
          })
        }
      })

    if (testID) gesture.withTestId(`${testID}-gesture`)

    return gesture
  }, [
    animationEnabled,
    animationToken,
    claim,
    completeClose,
    completeOpen,
    gestureStartX,
    hasLeftAction,
    hasRightAction,
    leftActionWidth,
    rightActionWidth,
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
          pressStyle="opacity"
          testID={testID ? `${testID}-pressable` : undefined}
          style={({ pressed }) => getCellInteractionStyle(cellToken, { pressed, disabled: false })}
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

export function SwipeCellGroup({ children, style, ...viewProps }: SwipeCellGroupProps) {
  const cellsRef = useRef(new Map<string, () => void>())
  const register = useCallback((id: string, close: () => void) => {
    cellsRef.current.set(id, close)
    return () => {
      cellsRef.current.delete(id)
    }
  }, [])
  const requestOpen = useCallback((id: string) => {
    cellsRef.current.forEach((closeCell, cellId) => {
      if (cellId !== id) closeCell()
    })
  }, [])
  const contextValue = useMemo<SwipeCellGroupContextValue>(
    () => ({ register, requestOpen }),
    [register, requestOpen],
  )

  return (
    <SwipeCellGroupContext.Provider value={contextValue}>
      <View {...viewProps} style={style}>
        {children}
      </View>
    </SwipeCellGroupContext.Provider>
  )
}

SwipeCellGroup.displayName = 'SwipeCellGroup'

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
