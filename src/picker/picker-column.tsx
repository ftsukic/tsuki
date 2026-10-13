import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { View } from 'react-native'
import { Gesture, GestureDetector } from '../gesture'
import { PlainPressable } from '../pressable/plain-pressable'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { useMotionConfig } from '../motion/useMotionConfig'
import { snapPickerOffset } from '../motion/gesture'
import { scheduleOnRN } from 'react-native-worklets'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated'
import { getPickerStyles } from './style'
import { getPickerToken } from './token'
import {
  DEFAULT_DURATION,
  findEnabledIndex,
  findEnabledIndexWorklet,
  getIndexByOffset,
  getMomentumTarget,
  getOffsetByIndex,
  MOMENTUM_TIME,
} from './utils'
import type { PickerOption } from './types'
import { getPickerWindow } from './window'
import { useScreenReader } from './useScreenReader'

const LOCK_DISTANCE = 10

export interface PickerColumnRef {
  stopMomentum(): number | null
}

export interface PickerColumnProps {
  items: readonly PickerOption[]
  selectedIndex: number
  selectionRevision?: number
  itemHeight: number
  visibleItemCount: number
  virtual?: boolean
  swipeDuration?: number
  disabled?: boolean
  columnIndex: number
  accessibilityLabel?: string
  onIndexChange?: (index: number) => void
  style?: StyleProp<ViewStyle>
  itemStyle?: StyleProp<ViewStyle>
  itemLabelStyle?: StyleProp<TextStyle>
  testID?: string
}

interface ItemProps {
  item: PickerOption
  index: number
  selected: boolean
  columnDisabled: boolean
  columnIndex: number
  accessibilityLabel?: string
  styles: ReturnType<typeof getPickerStyles>
  token: ReturnType<typeof getPickerToken>
  onPress: (index: number) => void
  itemStyle?: StyleProp<ViewStyle>
  itemLabelStyle?: StyleProp<TextStyle>
}

interface PendingSnap {
  emitChange: boolean
  index: number
}

const PickerColumnItem = memo(function PickerColumnItem({
  item,
  index,
  selected,
  columnDisabled,
  columnIndex,
  accessibilityLabel,
  styles,
  token,
  onPress,
  itemStyle,
  itemLabelStyle,
}: ItemProps) {
  const disabled = columnDisabled || item.disabled === true

  return (
    <PlainPressable
      accessibilityLabel={accessibilityLabel ? `${accessibilityLabel}, ${item.text}` : item.text}
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={() => onPress(index)}
      style={[
        styles.item,
        itemStyle,
        { height: styles.item.height },
        item.disabled && { opacity: token.picker_disabled_option_opacity },
      ]}
      testID={`picker-item-${columnIndex}-${index}`}
    >
      <Text numberOfLines={1} style={[styles.itemLabel, itemLabelStyle]}>
        {item.text}
      </Text>
    </PlainPressable>
  )
})

export const PickerColumn = forwardRef<PickerColumnRef, PickerColumnProps>(function PickerColumn(
  {
    items,
    selectedIndex,
    selectionRevision = 0,
    itemHeight,
    visibleItemCount,
    virtual = true,
    swipeDuration,
    disabled = false,
    columnIndex,
    accessibilityLabel,
    onIndexChange,
    style,
    itemStyle,
    itemLabelStyle,
    testID,
  },
  ref,
) {
  const { enabled: motionEnabled, durationScale } = useMotionConfig()
  const token = useComponentToken('Picker', getPickerToken)
  const count = items.length
  const visible = Math.max(1, Math.floor(visibleItemCount) || 1)
  const screenReader = useScreenReader()
  const windowed = virtual && screenReader !== true && count > visible * 5 + 1
  const waitingForAccessibility = windowed && screenReader === undefined
  const [windowState, setWindowState] = useState(() => ({
    items,
    selectedIndex,
    itemHeight,
    visible,
    selectionRevision,
    range: getPickerWindow(count, selectedIndex, visible),
  }))
  const windowInputsChanged =
    windowState.items !== items ||
    windowState.selectedIndex !== selectedIndex ||
    windowState.itemHeight !== itemHeight ||
    windowState.visible !== visible ||
    windowState.selectionRevision !== selectionRevision
  const range = windowInputsChanged
    ? getPickerWindow(count, selectedIndex, visible)
    : windowState.range
  const windowInputsRef = useRef({ items, itemHeight, visible, selectedIndex, selectionRevision })
  windowInputsRef.current = { items, itemHeight, visible, selectedIndex, selectionRevision }
  useLayoutEffect(() => {
    if (windowInputsChanged) {
      setWindowState({ items, selectedIndex, itemHeight, visible, selectionRevision, range })
    }
  }, [windowInputsChanged, items, selectedIndex, itemHeight, visible, selectionRevision, range])
  const resolvedSwipeDuration = Number.isFinite(swipeDuration)
    ? Math.max(0, swipeDuration as number)
    : DEFAULT_DURATION
  const styles = useMemo(
    () => getPickerStyles(token, itemHeight, visible),
    [itemHeight, token, visible],
  )
  const enabledFlags = useMemo(() => items.map((item) => !item.disabled), [items])
  const itemsKey = useMemo(
    () =>
      items
        .map((item) => `${typeof item.value}:${String(item.value)}:${item.disabled ? 'd' : 'e'}`)
        .join('|'),
    [items],
  )
  const selectedIndexRef = useRef(selectedIndex)
  selectedIndexRef.current = selectedIndex
  const onIndexChangeRef = useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange

  const initialIndex = findEnabledIndex(items, selectedIndex)
  const initialOffset = getOffsetByIndex(Math.max(0, initialIndex), itemHeight)
  const offset = useSharedValue(initialOffset)
  const requestedBucket = useSharedValue(-1)
  const updateWindow = useCallback(
    (index: number, bucket: number) => {
      const current = windowInputsRef.current
      if (
        current.items !== items ||
        current.itemHeight !== itemHeight ||
        current.visible !== visible ||
        current.selectedIndex !== selectedIndex ||
        current.selectionRevision !== selectionRevision ||
        requestedBucket.value !== bucket
      )
        return
      setWindowState((previous) => {
        const nextRange = getPickerWindow(count, index, visible)
        if (previous.range.start === nextRange.start && previous.range.end === nextRange.end)
          return previous
        return { items, selectedIndex, itemHeight, visible, selectionRevision, range: nextRange }
      })
    },
    [count, itemHeight, items, requestedBucket, visible, selectedIndex, selectionRevision],
  )
  useAnimatedReaction(
    () =>
      windowed
        ? Math.floor(Math.max(0, Math.min(count - 1, -offset.value / itemHeight)) / visible)
        : -1,
    (bucket, previous) => {
      if (bucket < 0 || bucket === previous) return
      requestedBucket.value = bucket
      scheduleOnRN(updateWindow, bucket * visible, bucket)
    },
    [count, itemHeight, visible, windowed, updateWindow],
  )
  const startOffset = useSharedValue(initialOffset)
  const momentumOffset = useSharedValue(initialOffset)
  const touchStartTime = useSharedValue(0)
  const panActive = useSharedValue(false)
  const panEndHandled = useSharedValue(false)
  const snapGeneration = useSharedValue(0)
  const pendingIndex = useSharedValue(-1)
  const generationRef = useRef(0)
  const pendingSnapRef = useRef<PendingSnap | null>(null)
  const previousItemsKeyRef = useRef<string | null>(null)
  const previousSelectedIndexRef = useRef(selectedIndex)
  const previousItemHeightRef = useRef(itemHeight)
  const previousSelectionRevisionRef = useRef(selectionRevision)
  const previousDisabledRef = useRef(disabled)

  const invalidateSnap = useCallback(() => {
    const generation = Math.max(generationRef.current, snapGeneration.value) + 1
    generationRef.current = generation
    snapGeneration.value = generation
    pendingIndex.value = -1
    pendingSnapRef.current = null
    return generation
  }, [pendingIndex, snapGeneration])

  const beginPan = useCallback(
    (generation: number) => {
      if (generation !== snapGeneration.value) return
      generationRef.current = generation
      pendingSnapRef.current = null
    },
    [snapGeneration],
  )

  const beginPendingSnap = useCallback(
    (index: number, generation: number, emitChange: boolean) => {
      if (generation !== snapGeneration.value) return
      generationRef.current = generation
      pendingSnapRef.current = { emitChange, index }
    },
    [snapGeneration],
  )

  const commitSnap = useCallback(
    (index: number, generation: number) => {
      const pending = pendingSnapRef.current
      if (
        generationRef.current !== generation ||
        snapGeneration.value !== generation ||
        pending === null ||
        pending.index !== index
      ) {
        return
      }
      pendingSnapRef.current = null
      pendingIndex.value = -1
      if (!pending.emitChange) return

      onIndexChangeRef.current?.(index)
    },
    [pendingIndex, snapGeneration],
  )

  useEffect(
    () => () => {
      cancelAnimation(offset)
      invalidateSnap()
    },
    [invalidateSnap, offset],
  )

  useLayoutEffect(() => {
    const structuralChange =
      previousItemsKeyRef.current !== null && previousItemsKeyRef.current !== itemsKey
    const selectedChange = previousSelectedIndexRef.current !== selectedIndex
    const itemHeightChange = previousItemHeightRef.current !== itemHeight

    if (
      previousItemsKeyRef.current === null ||
      structuralChange ||
      selectedChange ||
      itemHeightChange ||
      previousSelectionRevisionRef.current !== selectionRevision ||
      previousDisabledRef.current !== disabled
    ) {
      cancelAnimation(offset)
      invalidateSnap()
      panActive.value = false
      const nextIndex = findEnabledIndex(items, selectedIndex)
      offset.value = getOffsetByIndex(Math.max(0, nextIndex), itemHeight)
    }

    previousItemsKeyRef.current = itemsKey
    previousSelectedIndexRef.current = selectedIndex
    previousItemHeightRef.current = itemHeight
    previousSelectionRevisionRef.current = selectionRevision
    previousDisabledRef.current = disabled
  }, [
    disabled,
    invalidateSnap,
    itemHeight,
    items,
    itemsKey,
    offset,
    panActive,
    selectedIndex,
    selectionRevision,
  ])

  const animateTap = useCallback(
    (index: number) => {
      const targetIndex = findEnabledIndex(items, index)
      if (targetIndex < 0) return

      cancelAnimation(offset)
      const generation = invalidateSnap()
      const emitChange = targetIndex !== findEnabledIndex(items, selectedIndexRef.current)
      pendingIndex.value = targetIndex
      pendingSnapRef.current = { emitChange, index: targetIndex }
      const targetOffset = getOffsetByIndex(targetIndex, itemHeight)
      if (!motionEnabled) {
        offset.value = targetOffset
        commitSnap(targetIndex, generation)
        return
      }
      offset.value = snapPickerOffset(
        targetOffset,
        DEFAULT_DURATION,
        motionEnabled,
        (finished) => {
          'worklet'
          if (finished && snapGeneration.value === generation) {
            scheduleOnRN(commitSnap, targetIndex, generation)
          }
        },
        durationScale,
      )
    },
    [
      commitSnap,
      durationScale,
      invalidateSnap,
      itemHeight,
      items,
      motionEnabled,
      offset,
      pendingIndex,
      snapGeneration,
    ],
  )

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(!disabled && count > 0)
      .maxPointers(1)
      .activeOffsetY([-LOCK_DISTANCE, LOCK_DISTANCE])
      .failOffsetX([-LOCK_DISTANCE, LOCK_DISTANCE])
      .onBegin(() => {
        'worklet'
        panActive.value = false
        panEndHandled.value = false
      })
      .onStart(() => {
        'worklet'
        if (count === 0) return
        const generation = snapGeneration.value + 1
        snapGeneration.value = generation
        panActive.value = true
        panEndHandled.value = false
        pendingIndex.value = -1
        cancelAnimation(offset)
        startOffset.value = offset.value
        momentumOffset.value = offset.value
        touchStartTime.value = Date.now()
        scheduleOnRN(beginPan, generation)
      })
      .onUpdate((event) => {
        'worklet'
        if (!panActive.value || count === 0) return
        const nextOffset = startOffset.value + event.translationY
        const minOffset = -count * itemHeight
        offset.value = Math.max(minOffset, Math.min(itemHeight, nextOffset))
        const now = Date.now()
        if (now - touchStartTime.value > MOMENTUM_TIME) {
          touchStartTime.value = now
          momentumOffset.value = offset.value
        }
      })
      .onEnd((event, success) => {
        'worklet'
        if (!panActive.value || !success || count === 0) return

        const duration = Math.max(1, Date.now() - touchStartTime.value)
        const momentumTarget = getMomentumTarget({
          offset: offset.value,
          momentumOffset: momentumOffset.value,
          duration,
        })
        const rawIndex = getIndexByOffset(momentumTarget ?? offset.value, itemHeight, count)
        const targetIndex = findEnabledIndexWorklet(enabledFlags, rawIndex)
        if (targetIndex < 0) {
          panEndHandled.value = true
          return
        }

        const generation = snapGeneration.value + 1
        snapGeneration.value = generation
        const emitChange = targetIndex !== selectedIndex
        pendingIndex.value = targetIndex
        panEndHandled.value = true
        scheduleOnRN(beginPendingSnap, targetIndex, generation, emitChange)
        const targetOffset = getOffsetByIndex(targetIndex, itemHeight)
        if (!motionEnabled) {
          offset.value = targetOffset
          scheduleOnRN(commitSnap, targetIndex, generation)
        } else {
          offset.value = snapPickerOffset(
            targetOffset,
            resolvedSwipeDuration,
            motionEnabled,
            (finished) => {
              'worklet'
              if (finished && snapGeneration.value === generation) {
                scheduleOnRN(commitSnap, targetIndex, generation)
              }
            },
            durationScale,
          )
        }
      })
      .onFinalize(() => {
        'worklet'
        if (!panActive.value) return

        if (!panEndHandled.value && count > 0) {
          const rawIndex = getIndexByOffset(offset.value, itemHeight, count)
          const targetIndex = findEnabledIndexWorklet(enabledFlags, rawIndex)
          if (targetIndex >= 0) {
            const generation = snapGeneration.value + 1
            snapGeneration.value = generation
            const emitChange = targetIndex !== selectedIndex
            pendingIndex.value = targetIndex
            panEndHandled.value = true
            scheduleOnRN(beginPendingSnap, targetIndex, generation, emitChange)
            const targetOffset = getOffsetByIndex(targetIndex, itemHeight)
            if (!motionEnabled) {
              offset.value = targetOffset
              scheduleOnRN(commitSnap, targetIndex, generation)
            } else {
              offset.value = snapPickerOffset(
                targetOffset,
                resolvedSwipeDuration,
                motionEnabled,
                (finished) => {
                  'worklet'
                  if (finished && snapGeneration.value === generation) {
                    scheduleOnRN(commitSnap, targetIndex, generation)
                  }
                },
                durationScale,
              )
            }
          }
        }

        panActive.value = false
        panEndHandled.value = false
      })

    if (testID) pan.withTestId(`${testID}-gesture`)
    return pan
  }, [
    beginPan,
    beginPendingSnap,
    commitSnap,
    count,
    disabled,
    durationScale,
    enabledFlags,
    itemHeight,
    motionEnabled,
    momentumOffset,
    offset,
    panActive,
    panEndHandled,
    pendingIndex,
    snapGeneration,
    startOffset,
    resolvedSwipeDuration,
    selectedIndex,
    testID,
    touchStartTime,
  ])

  useImperativeHandle(
    ref,
    () => ({
      stopMomentum() {
        const pendingIndexValue =
          pendingSnapRef.current?.index ??
          (pendingIndex.value >= 0 ? pendingIndex.value : undefined)
        cancelAnimation(offset)
        invalidateSnap()
        if (count === 0) {
          offset.value = 0
          return null
        }

        const rawIndex = pendingIndexValue ?? getIndexByOffset(offset.value, itemHeight, count)
        const finalIndex = findEnabledIndex(items, rawIndex)
        if (finalIndex < 0) {
          offset.value = 0
          return null
        }
        offset.value = getOffsetByIndex(finalIndex, itemHeight)
        return finalIndex
      },
    }),
    [count, invalidateSnap, itemHeight, items, offset, pendingIndex],
  )

  const handlePress = useCallback(
    (index: number) => {
      if (disabled || items[index]?.disabled) return
      animateTap(index)
    },
    [animateTap, disabled, items],
  )
  const wrapperStyle = useAnimatedStyle(
    () => ({ transform: [{ translateY: ((visible - 1) * itemHeight) / 2 + offset.value }] }),
    [itemHeight, offset, visible],
  )

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        collapsable={false}
        style={[styles.column, style]}
        testID={testID}
      >
        <Animated.View style={wrapperStyle} testID={testID ? `${testID}-viewport` : undefined}>
          {windowed && range.start > 0 ? (
            <View style={{ height: range.start * itemHeight }} />
          ) : null}
          {(waitingForAccessibility
            ? []
            : windowed
              ? items.slice(range.start, range.end)
              : items
          ).map((item, localIndex) => {
            const index = localIndex + (windowed ? range.start : 0)
            return (
              <PickerColumnItem
                key={`${typeof item.value}:${String(item.value)}:${index}`}
                columnIndex={columnIndex}
                accessibilityLabel={accessibilityLabel}
                index={index}
                item={item}
                columnDisabled={disabled}
                itemLabelStyle={itemLabelStyle}
                itemStyle={itemStyle}
                onPress={handlePress}
                selected={index === selectedIndex}
                styles={styles}
                token={token}
              />
            )
          })}
          {windowed && range.end < count ? (
            <View style={{ height: (count - range.end) * itemHeight }} />
          ) : null}
          {waitingForAccessibility ? (
            <View style={{ height: (range.end - range.start) * itemHeight }} />
          ) : null}
        </Animated.View>
      </View>
    </GestureDetector>
  )
})

PickerColumn.displayName = 'PickerColumn'
