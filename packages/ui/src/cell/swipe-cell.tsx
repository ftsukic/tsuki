import LoadingIcon from '../loading/loading-icon'
import { useToken } from '../theme'
import { Cell } from './cell'
import type { SwipeCellAction, SwipeCellProps, SwipeCellRef } from './interface'
import { subscribeSwipeCellClickAway } from './swipe-cell-events'
import { createSwipeCellStyles } from './swipe-cell-style'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import type {
  SwipeableMethods,
  SwipeableProps,
} from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

/**
 * 必须高于所有 Action。
 *
 * Action 内部仍然可以通过 1 / 2 / 3 做彼此之间的层叠，
 * 但永远不能盖到 foreground Cell 上。
 */
const FOREGROUND_Z_INDEX = 1000

const swipeCellLayoutStyles = StyleSheet.create({
  foreground: {
    position: 'relative',
    zIndex: FOREGROUND_Z_INDEX,
  },

  actionsRow: {
    flexDirection: 'row',
    flexShrink: 0,

    /**
     * ReanimatedSwipeable 自己的 actions 容器已经 absoluteFill，
     * 这里继续向下把完整高度传递给 ActionItem。
     */
    alignSelf: 'stretch',
    alignItems: 'stretch',
    height: '100%',

    zIndex: 0,
  },

  actionItem: {
    position: 'relative',
    flexShrink: 0,

    /**
     * 跟 Cell 保持完全相同高度。
     */
    alignSelf: 'stretch',
    height: '100%',
  },

  actionButtonFill: {
    /**
     * 父级是 column，
     * flex: 1 只负责把高度撑满，
     * 不会把 action 横向 width 固定。
     */
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },

  hiddenContent: {
    opacity: 0,
  },

  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

type SwipeActionSide = 'left' | 'right'

interface DisplayActionsSnapshot {
  left?: SwipeCellAction[]
  right?: SwipeCellAction[]
  actionLayoutKey: SwipeCellProps['actionLayoutKey']
}

interface ActionSourceSnapshot {
  left: SwipeCellProps['left']
  right: SwipeCellProps['right']
  actionLayoutKey: SwipeCellProps['actionLayoutKey']
}

/**
 * 创建当前 Swipe 生命周期使用的快照。
 *
 * 外部即使发生：
 *
 * 置顶 -> 取消置顶
 *
 * 当前正在打开 / 关闭的 Swipe action 也不会立刻发生宽度变化。
 */
function snapshotActions(
  actions: readonly SwipeCellAction[] | undefined,
): SwipeCellAction[] | undefined {
  if (!actions?.length) {
    return undefined
  }

  return actions.map((action) => ({
    ...action,
  }))
}

function SwipeActionButton({
  action,
  onAction,
}: {
  action: SwipeCellAction
  onAction: (action: SwipeCellAction) => void | Promise<void>
}) {
  const { components } = useToken()
  const token = components.SwipeCell
  const loadingToken = components.Loading

  const styles = useMemo(() => createSwipeCellStyles(token), [token])

  const [loading, setLoading] = useState(false)

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  const handlePress = useCallback(() => {
    if (action.disabled || loading) {
      return
    }

    setLoading(true)

    let result: void | Promise<void>

    try {
      result = onAction(action)
    } catch (error) {
      console.error('[SwipeCell] action failed:', error)

      if (mountedRef.current) {
        setLoading(false)
      }

      return
    }

    void Promise.resolve(result)
      .catch((error) => {
        console.error('[SwipeCell] action failed:', error)
      })
      .finally(() => {
        if (mountedRef.current) {
          setLoading(false)
        }
      })
  }, [action, loading, onAction])

  const text = action.text

  const actionButtonStyle = action.actionButtonProps?.style

  const content =
    typeof text === 'string' || typeof text === 'number' ? (
      <Text
        ellipsizeMode={action.ellipsizeMode ?? 'tail'}
        numberOfLines={action.textNumberOfLines ?? 1}
        style={[
          styles.actionText,
          action.style,
          action.color
            ? {
                color: action.color,
              }
            : null,
        ]}
      >
        {text}
      </Text>
    ) : (
      text
    )

  return (
    <Pressable
      {...action.actionButtonProps}
      disabled={action.disabled || loading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.actionButton,

        swipeCellLayoutStyles.actionButtonFill,

        {
          /**
           * 不设置 width。
           *
           * action width =
           *
           * text intrinsic width
           * +
           * paddingHorizontal * 2
           */
          flexShrink: 0,

          minWidth: action.minWidth ?? token.actionMinWidth,

          maxWidth: action.maxWidth,

          backgroundColor: action.backgroundColor ?? token.actionBackgroundColor,
        },

        action.disabled
          ? {
              opacity: token.actionDisabledOpacity,
            }
          : null,

        typeof actionButtonStyle === 'function'
          ? actionButtonStyle({
              pressed,
            })
          : actionButtonStyle,
      ]}
    >
      <View style={styles.actionContent}>
        {/*
         * loading 不能替换掉原始 content，
         * 否则 "取消置顶" 会瞬间缩成 spinner 宽度。
         */}
        <View style={loading ? swipeCellLayoutStyles.hiddenContent : undefined}>{content}</View>

        {loading ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, swipeCellLayoutStyles.loadingOverlay]}
          >
            <LoadingIcon
              color={action.color ?? token.actionTextColor}
              duration={loadingToken.animationDuration}
              size={loadingToken.iconSize}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

function SwipeActionItem({
  action,
  actionCount,
  actionWidths,
  index,
  onAction,
  progress,
  side,
}: {
  action: SwipeCellAction
  actionCount: number
  actionWidths: SharedValue<number[]>
  index: number
  onAction: (action: SwipeCellAction) => void | Promise<void>
  progress: SharedValue<number>
  side: SwipeActionSide
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const boundedProgress = Math.min(Math.max(progress.value, 0), 1)

    /**
     * 使用一个轻微非线性的展开曲线。
     *
     * 相比直接使用 progress，
     * 可以让 Actions 在 Swipe 前半段保持更明显的层叠，
     * 后半段再完全展开。
     *
     * progress:
     *
     * 0   -> 0
     * 0.5 -> 0.25
     * 1   -> 1
     */
    const revealProgress = boundedProgress * boundedProgress

    let offset = 0

    if (side === 'right') {
      /**
       * Right：
       *
       * [ A ][ B ][ C ]
       *
       * C 为最外侧。
       *
       * A 需要向右移动 B + C
       * B 需要向右移动 C
       * C 不移动
       */
      for (let widthIndex = index + 1; widthIndex < actionCount; widthIndex += 1) {
        offset += actionWidths.value[widthIndex] ?? 0
      }
    } else {
      /**
       * Left 对称处理。
       *
       * A 为最外侧。
       */
      for (let widthIndex = 0; widthIndex < index; widthIndex += 1) {
        offset += actionWidths.value[widthIndex] ?? 0
      }
    }

    const direction = side === 'right' ? 1 : -1

    return {
      transform: [
        {
          translateX: (1 - revealProgress) * offset * direction,
        },
      ],
    }
  }, [actionCount, actionWidths, index, progress, side])

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width

      const currentWidths = actionWidths.value

      const previousWidth = currentWidths[index] ?? 0

      /**
       * 避免浮点 layout 抖动导致不停写 SharedValue。
       */
      if (Math.abs(previousWidth - width) < 0.5) {
        return
      }

      const nextWidths = currentWidths.slice()

      nextWidths[index] = width

      actionWidths.value = nextWidths
    },
    [actionWidths, index],
  )

  /**
   * 层级只用于 actions 自己之间。
   *
   * foreground = 1000，
   * 因此 action 永远不会再盖住 Cell。
   */
  const zIndex = side === 'right' ? index + 1 : actionCount - index

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[
        swipeCellLayoutStyles.actionItem,
        {
          zIndex,
        },
        animatedStyle,
      ]}
    >
      <SwipeActionButton action={action} onAction={onAction} />
    </Animated.View>
  )
}

function RenderActions({
  actions,
  actionWidths,
  onAction,
  progress,
  side,
}: {
  actions?: SwipeCellAction[]
  actionWidths: SharedValue<number[]>
  onAction: (action: SwipeCellAction) => void | Promise<void>
  progress: SharedValue<number>
  side: SwipeActionSide
}) {
  if (!actions?.length) {
    return null
  }

  return (
    <View style={swipeCellLayoutStyles.actionsRow}>
      {actions.map((action, index) => (
        <SwipeActionItem
          /*
           * 当前你的 actions 数量、顺序固定，只改变 text，
           * 因此 index 在当前场景是稳定的。
           *
           * 如果 SwipeCellAction 已经有 key，
           * 推荐直接改成：
           *
           * key={action.key}
           */
          key={index}
          action={action}
          actionCount={actions.length}
          actionWidths={actionWidths}
          index={index}
          onAction={onAction}
          progress={progress}
          side={side}
        />
      ))}
    </View>
  )
}

export const SwipeCellView = forwardRef<SwipeCellRef, SwipeCellProps>(
  (
    {
      left,
      right,
      actionLayoutKey,
      closeOnAction = true,
      closeOnTouchOutside = true,
      swipeableProps,
      ...cellProps
    },
    ref,
  ) => {
    const { components } = useToken()

    const swipeableRef = useRef<SwipeableMethods | null>(null)

    /**
     * 当前 Swipe 生命周期是否冻结 Actions。
     */
    const actionsFrozenRef = useRef(false)

    /**
     * frozen 过程中 left/right 是否发生过变化。
     */
    const actionsDirtyRef = useRef(false)

    /**
     * 始终保存业务传入的最新 Action。
     */
    const latestLeftRef = useRef<SwipeCellProps['left']>(left)

    const latestRightRef = useRef<SwipeCellProps['right']>(right)

    const latestActionLayoutKeyRef = useRef<SwipeCellProps['actionLayoutKey']>(actionLayoutKey)

    latestLeftRef.current = left

    latestRightRef.current = right

    latestActionLayoutKeyRef.current = actionLayoutKey

    /**
     * 真正交给 ReanimatedSwipeable 渲染的 Action。
     *
     * 与业务实时 left/right 分离。
     */
    const [displayActions, setDisplayActions] = useState<DisplayActionsSnapshot>(() => ({
      left: snapshotActions(left),
      right: snapshotActions(right),
      actionLayoutKey,
    }))

    const leftActionWidths = useSharedValue<number[]>([])

    const rightActionWidths = useSharedValue<number[]>([])

    const {
      childrenContainerStyle,

      onSwipeableOpenStartDrag: userOnSwipeableOpenStartDrag,

      onSwipeableCloseStartDrag: userOnSwipeableCloseStartDrag,

      onSwipeableWillOpen: userOnSwipeableWillOpen,

      onSwipeableClose: userOnSwipeableClose,

      ...restSwipeableProps
    } = swipeableProps ?? {}

    /**
     * Cell 当前真正的背景。
     *
     * 优先：
     *
     * 1. cellProps.style.backgroundColor
     * 2. cellProps.theme.backgroundColor
     * 3. Cell token
     * 4. #fff fallback
     */
    const cellStyle = StyleSheet.flatten(cellProps.style)

    const cellBackgroundColor =
      cellStyle?.backgroundColor ??
      cellProps.theme?.backgroundColor ??
      components.Cell.backgroundColor ??
      '#fff'

    const syncDisplayActions = useCallback(() => {
      /**
       * Action text 可能已经：
       *
       * 置顶 -> 取消置顶
       *
       * intrinsic width 已改变，
       * 所以必须清空旧宽度。
       */
      leftActionWidths.value = []
      rightActionWidths.value = []

      setDisplayActions({
        left: snapshotActions(latestLeftRef.current),

        right: snapshotActions(latestRightRef.current),

        actionLayoutKey: latestActionLayoutKeyRef.current,
      })

      actionsDirtyRef.current = false
    }, [leftActionWidths, rightActionWidths])

    const freezeActions = useCallback(() => {
      actionsFrozenRef.current = true
    }, [])

    const thawActions = useCallback(() => {
      actionsFrozenRef.current = false

      if (!actionsDirtyRef.current) {
        return
      }

      syncDisplayActions()
    }, [syncDisplayActions])

    /**
     * 监听业务 Action 变化。
     */
    const previousSourceRef = useRef<ActionSourceSnapshot>({
      left,
      right,
      actionLayoutKey,
    })

    useEffect(() => {
      const previous = previousSourceRef.current

      const changed =
        previous.left !== left ||
        previous.right !== right ||
        previous.actionLayoutKey !== actionLayoutKey

      previousSourceRef.current = {
        left,
        right,
        actionLayoutKey,
      }

      if (!changed) {
        return
      }

      /**
       * 正在 Swipe：
       *
       * 不允许当前 geometry 改变。
       */
      if (actionsFrozenRef.current) {
        actionsDirtyRef.current = true

        return
      }

      /**
       * 完全关闭：
       *
       * 可以同步最新内容。
       */
      syncDisplayActions()
    }, [actionLayoutKey, left, right, syncDisplayActions])

    /**
     * 点击 Action。
     *
     * 业务立即执行，
     * 不再使用 pendingAction 等待 close。
     */
    const executeAction = useCallback(
      async (action: SwipeCellAction): Promise<void> => {
        if (action.disabled) {
          return
        }

        if (closeOnAction) {
          /**
           * 在业务状态变化之前保证 snapshot frozen。
           */
          freezeActions()

          swipeableRef.current?.close()
        }

        await action.onPress?.()
      },
      [closeOnAction, freezeActions],
    )

    const handleSwipeableOpenStartDrag = useCallback<
      NonNullable<SwipeableProps['onSwipeableOpenStartDrag']>
    >(
      (direction) => {
        /**
         * 手势刚开始就冻结。
         */
        freezeActions()

        userOnSwipeableOpenStartDrag?.(direction)
      },
      [freezeActions, userOnSwipeableOpenStartDrag],
    )

    const handleSwipeableCloseStartDrag = useCallback<
      NonNullable<SwipeableProps['onSwipeableCloseStartDrag']>
    >(
      (direction) => {
        freezeActions()

        userOnSwipeableCloseStartDrag?.(direction)
      },
      [freezeActions, userOnSwipeableCloseStartDrag],
    )

    const handleSwipeableWillOpen = useCallback<NonNullable<SwipeableProps['onSwipeableWillOpen']>>(
      (direction) => {
        /**
         * programmatic openLeft/openRight 兜底。
         */
        freezeActions()

        userOnSwipeableWillOpen?.(direction)
      },
      [freezeActions, userOnSwipeableWillOpen],
    )

    const handleSwipeableClose = useCallback<NonNullable<SwipeableProps['onSwipeableClose']>>(
      (direction) => {
        try {
          userOnSwipeableClose?.(direction)
        } finally {
          /**
           * 完全关闭以后：
           *
           * 置顶 -> 取消置顶
           *
           * 等最新 action 才真正同步进来。
           */
          thawActions()
        }
      },
      [thawActions, userOnSwipeableClose],
    )

    const close = useCallback(() => {
      swipeableRef.current?.close()
    }, [])

    const openLeft = useCallback(() => {
      if (!latestLeftRef.current?.length) {
        return
      }

      freezeActions()

      swipeableRef.current?.openLeft()
    }, [freezeActions])

    const openRight = useCallback(() => {
      if (!latestRightRef.current?.length) {
        return
      }

      freezeActions()

      swipeableRef.current?.openRight()
    }, [freezeActions])

    const reset = useCallback(() => {
      swipeableRef.current?.reset()

      /**
       * reset 没有完整 close 生命周期，
       * 所以手动解除冻结。
       */
      actionsFrozenRef.current = false

      syncDisplayActions()
    }, [syncDisplayActions])

    useImperativeHandle(
      ref,
      () => ({
        close,
        openLeft,
        openRight,
        reset,
      }),
      [close, openLeft, openRight, reset],
    )

    useEffect(() => {
      if (!closeOnTouchOutside) {
        return undefined
      }

      const subscription = subscribeSwipeCellClickAway(close)

      return () => {
        subscription.remove()
      }
    }, [close, closeOnTouchOutside])

    const renderLeftActions = useCallback<NonNullable<SwipeableProps['renderLeftActions']>>(
      (progress) => (
        <RenderActions
          actions={displayActions.left}
          actionWidths={leftActionWidths}
          onAction={executeAction}
          progress={progress}
          side="left"
        />
      ),
      [displayActions.left, executeAction, leftActionWidths],
    )

    const renderRightActions = useCallback<NonNullable<SwipeableProps['renderRightActions']>>(
      (progress) => (
        <RenderActions
          actions={displayActions.right}
          actionWidths={rightActionWidths}
          onAction={executeAction}
          progress={progress}
          side="right"
        />
      ),
      [displayActions.right, executeAction, rightActionWidths],
    )

    return (
      <ReanimatedSwipeable
        key={displayActions.actionLayoutKey}
        {...restSwipeableProps}
        ref={swipeableRef}
        onSwipeableOpenStartDrag={handleSwipeableOpenStartDrag}
        onSwipeableCloseStartDrag={handleSwipeableCloseStartDrag}
        onSwipeableWillOpen={handleSwipeableWillOpen}
        onSwipeableClose={handleSwipeableClose}
        childrenContainerStyle={[
          /**
           * foreground 放在外部样式之前，
           * 最后再强制设置 background/zIndex，
           * 防止被 childrenContainerStyle 覆盖。
           */
          swipeCellLayoutStyles.foreground,

          childrenContainerStyle,

          {
            /**
             * 关键：
             *
             * 必须 opaque。
             */
            backgroundColor: cellBackgroundColor,

            /**
             * ActionItem 最大只是 1 / 2 / 3...
             * foreground 永远最高。
             */
            zIndex: FOREGROUND_Z_INDEX,
          },
        ]}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={displayActions.left?.length ? renderLeftActions : undefined}
        renderRightActions={displayActions.right?.length ? renderRightActions : undefined}
      >
        <Cell {...cellProps} />
      </ReanimatedSwipeable>
    )
  },
)

SwipeCellView.displayName = 'SwipeCell'

export type { SwipeableProps }
