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
  useState,
  type ReactNode,
} from 'react'
import { Animated, Platform, View } from 'react-native'
import type { GestureResponderEvent, LayoutChangeEvent, PressableProps } from 'react-native'
import { InteractionPressable, useInteraction, usePanGesture } from '../interaction'
import { getCellInteractionStyle } from '../cell/style'
import { getCellToken } from '../cell/token'
import { useComponentToken, useToken } from '../theme'
import { SwipeCellAction } from './action'
import { getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import type {
  SwipeCellActionItem,
  SwipeCellActionProps,
  SwipeCellGroupProps,
  SwipeCellProps,
  SwipeCellRef,
  SwipeCellSide,
} from './interface'

interface SwipeCellGroupContextValue {
  register: (id: string, close: () => void) => () => void
  requestOpen: (id: string) => void
}

const SwipeCellGroupContext = createContext<SwipeCellGroupContextValue | null>(null)

interface ActionWidths {
  left: number
  right: number
}

function isVisibleAction(action: ReactNode) {
  return action !== null && action !== undefined && action !== false
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getActionWidth(side: SwipeCellSide, widths: ActionWidths) {
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
      backgroundColor={action.backgroundColor}
      textColor={action.textColor}
      width={action.width}
      disabled={action.disabled}
      onPress={wrapActionPress(action.onPress, close, closeOnActionPress)}
    >
      {action.label}
    </SwipeCellAction>
  ))
}

export const SwipeCell = forwardRef<SwipeCellRef, SwipeCellProps>(function SwipeCell(
  {
    children,
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
    testID,
    ...viewProps
  },
  ref,
) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('SwipeCell', getSwipeCellToken)
  const cellToken = useComponentToken('Cell', getCellToken)
  const resolvedStyles = useMemo(() => getSwipeCellStyles(token), [token])
  const group = useContext(SwipeCellGroupContext)
  const interaction = useInteraction()
  const id = useId()
  const translation = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)
  const currentOffsetRef = useRef(0)
  const gestureStartOffsetRef = useRef(0)
  const pendingOpenRef = useRef<SwipeCellSide | null>(null)
  const openSideRef = useRef<SwipeCellSide | null>(null)
  const actionWidthsRef = useRef<ActionWidths>({ left: 0, right: 0 })
  const [actionWidths, setActionWidths] = useState<ActionWidths>({ left: 0, right: 0 })
  const hasLeftAction =
    leftActions !== undefined ? leftActions.length > 0 : isVisibleAction(leftAction)
  const hasRightAction =
    rightActions !== undefined ? rightActions.length > 0 : isVisibleAction(rightAction)
  const animationDuration = themeToken.motion ? token.animationDuration : 0

  const animateTo = useCallback(
    (offset: number) => {
      animationRef.current?.stop()
      animationRef.current = null
      currentOffsetRef.current = offset

      if (animationDuration === 0) {
        translation.setValue(offset)
        return
      }

      const animation = Animated.timing(translation, {
        toValue: offset,
        duration: animationDuration,
        isInteraction: false,
        useNativeDriver: Platform.OS !== 'web',
      })
      animationRef.current = animation
      animation.start(({ finished }) => {
        if (animationRef.current === animation) animationRef.current = null
        if (finished) translation.setValue(offset)
      })
    },
    [animationDuration, translation],
  )

  const close = useCallback(() => {
    pendingOpenRef.current = null
    openSideRef.current = null
    animateTo(0)
    interaction.clear(id)
  }, [animateTo, id, interaction])

  const resolveOpenSide = useCallback((side: SwipeCellSide) => {
    const requestedWidth = getActionWidth(side, actionWidthsRef.current)
    if (requestedWidth > 0) return side

    const fallback: SwipeCellSide = side === 'left' ? 'right' : 'left'
    return getActionWidth(fallback, actionWidthsRef.current) > 0 ? fallback : null
  }, [])

  const open = useCallback(
    (side: SwipeCellSide = 'right') => {
      if (!hasLeftAction && !hasRightAction) {
        close()
        return
      }

      interaction.requestOpen(id, close)
      group?.requestOpen(id)
      const resolvedSide = resolveOpenSide(side)
      if (!resolvedSide) {
        pendingOpenRef.current = side
        openSideRef.current = side
        return
      }

      pendingOpenRef.current = resolvedSide
      openSideRef.current = resolvedSide
      const width = getActionWidth(resolvedSide, actionWidthsRef.current)
      if (width > 0) {
        pendingOpenRef.current = null
        animateTo(getOffset(resolvedSide, width))
      }
    },
    [animateTo, close, group, hasLeftAction, hasRightAction, id, interaction, resolveOpenSide],
  )

  const handleActionLayout = useCallback((side: SwipeCellSide, event: LayoutChangeEvent) => {
    const width = Number.isFinite(event.nativeEvent.layout.width)
      ? Math.max(0, event.nativeEvent.layout.width)
      : 0
    actionWidthsRef.current[side] = width
    setActionWidths((previous) =>
      previous[side] === width ? previous : { ...previous, [side]: width },
    )
  }, [])

  useEffect(() => {
    const nextWidths = { ...actionWidthsRef.current }
    let changed = false
    if (!hasLeftAction && nextWidths.left !== 0) {
      nextWidths.left = 0
      changed = true
    }
    if (!hasRightAction && nextWidths.right !== 0) {
      nextWidths.right = 0
      changed = true
    }
    if (changed) {
      actionWidthsRef.current = nextWidths
      setActionWidths(nextWidths)
    }
  }, [hasLeftAction, hasRightAction])

  useEffect(() => {
    const pendingSide = pendingOpenRef.current
    if (!pendingSide) return

    const width = getActionWidth(pendingSide, actionWidths)
    if (width <= 0) return

    pendingOpenRef.current = null
    animateTo(getOffset(pendingSide, width))
  }, [actionWidths, animateTo])

  useEffect(() => {
    const openSide = openSideRef.current
    if (!openSide || pendingOpenRef.current) return

    const width = getActionWidth(openSide, actionWidths)
    if (width > 0 && Math.abs(currentOffsetRef.current) !== width) {
      animateTo(getOffset(openSide, width))
    }
  }, [actionWidths, animateTo])

  useEffect(() => {
    if (!group) return undefined
    return group.register(id, close)
  }, [close, group, id])

  useEffect(
    () => () => {
      animationRef.current?.stop()
      interaction.clear(id)
    },
    [id, interaction],
  )

  useImperativeHandle(ref, () => ({ open, close }), [close, open])

  const onStart = useCallback(() => {
    animationRef.current?.stop()
    animationRef.current = null
    translation.stopAnimation((value) => {
      currentOffsetRef.current = value
      gestureStartOffsetRef.current = value
    })
    gestureStartOffsetRef.current = currentOffsetRef.current
  }, [translation])

  const onChange = useCallback(
    ({ distance }: { distance: number }) => {
      const nextOffset = clamp(
        gestureStartOffsetRef.current + distance,
        -actionWidthsRef.current.right,
        actionWidthsRef.current.left,
      )
      currentOffsetRef.current = nextOffset
      translation.setValue(nextOffset)
    },
    [translation],
  )

  const onEnd = useCallback(
    ({ distance }: { distance: number }) => {
      const offset = clamp(
        gestureStartOffsetRef.current + distance,
        -actionWidthsRef.current.right,
        actionWidthsRef.current.left,
      )
      currentOffsetRef.current = offset

      if (offset > 0 && offset > actionWidthsRef.current.left / 2) {
        open('left')
      } else if (offset < 0 && Math.abs(offset) > actionWidthsRef.current.right / 2) {
        open('right')
      } else {
        close()
      }
    },
    [close, open],
  )

  const responder = usePanGesture({
    axis: 'horizontal',
    shouldActivate: ({ distance }) =>
      distance > 0
        ? actionWidthsRef.current.left > 0 || currentOffsetRef.current < 0
        : actionWidthsRef.current.right > 0 || currentOffsetRef.current > 0,
    onStart,
    onChange,
    onEnd,
  })

  const handleContentTouchStart = useCallback(() => {
    interaction.notifyPress(id)
    if (Math.abs(currentOffsetRef.current) > 0) close()
  }, [close, id, interaction])

  const renderedLeftActions =
    leftActions !== undefined
      ? renderActionItems(leftActions, close, closeOnActionPress, id)
      : mergeActionPress(leftAction, onLeftActionPress, close, closeOnActionPress, id)
  const renderedRightActions =
    rightActions !== undefined
      ? renderActionItems(rightActions, close, closeOnActionPress, id)
      : mergeActionPress(rightAction, onRightActionPress, close, closeOnActionPress, id)
  const renderedContent = (
    <Animated.View
      {...responder.panHandlers}
      onTouchStart={handleContentTouchStart}
      testID={testID ? `${testID}-content` : undefined}
      style={[resolvedStyles.content, contentStyle, { transform: [{ translateX: translation }] }]}
    >
      <InteractionPressable
        interactionId={id}
        onPress={close}
        testID={testID ? `${testID}-pressable` : undefined}
        style={({ pressed }) => getCellInteractionStyle(cellToken, { pressed, disabled: false })}
      >
        {children}
      </InteractionPressable>
    </Animated.View>
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
      <View>{renderedContent}</View>
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
    cellsRef.current.forEach((close, cellId) => {
      if (cellId !== id) close()
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
  const { closeCurrent } = useInteraction()
  return useMemo(
    () => ({
      closeCurrent,
      closeCurrentSwipeCell: closeCurrent,
    }),
    [closeCurrent],
  )
}
