import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'
import { Animated, View } from 'react-native'
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as ScrollViewType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native'
import { InteractionPressable } from '../interaction'
import { useComponentToken } from '../theme'
import { getPickerStyles } from './styles'
import { getPickerToken } from './token'
import type { PickerOption } from './types'

const MIN_OFFSET_EPSILON = 0.5

function clampIndex(index: number, maxIndex: number) {
  return Math.min(maxIndex, Math.max(0, Number.isFinite(index) ? index : 0))
}

function getSnapIndex(offset: number, itemHeight: number, maxIndex: number) {
  return clampIndex(itemHeight > 0 ? Math.round(offset / itemHeight) : 0, maxIndex)
}

export interface PickerColumnProps {
  items: readonly PickerOption[]
  selectedIndex: number
  itemHeight: number
  visibleItemCount: number
  columnIndex: number
  onIndexChange?: (index: number) => void
  style?: StyleProp<ViewStyle>
  itemStyle?: StyleProp<ViewStyle>
  itemLabelStyle?: StyleProp<TextStyle>
  testID?: string
}

export const PickerColumn = forwardRef<View, PickerColumnProps>(function PickerColumn(
  {
    items,
    selectedIndex,
    itemHeight,
    visibleItemCount,
    columnIndex,
    onIndexChange,
    style,
    itemStyle,
    itemLabelStyle,
    testID,
  },
  ref,
) {
  const token = useComponentToken('Picker', getPickerToken)
  const resolvedVisibleItemCount = Math.max(1, Math.floor(visibleItemCount) || 1)
  const topInset = ((resolvedVisibleItemCount - 1) * itemHeight) / 2
  const maxIndex = Math.max(0, items.length - 1)
  const initialIndex = clampIndex(selectedIndex, maxIndex)
  const offset = useRef(new Animated.Value(initialIndex * itemHeight)).current
  const offsetRef = useRef(initialIndex * itemHeight)
  const scrollIndexRef = useRef(initialIndex)
  const selectedIndexRef = useRef(initialIndex)
  const itemHeightRef = useRef(itemHeight)
  const itemCountRef = useRef(items.length)
  const initializedRef = useRef(false)
  const scrollRef = useRef<ScrollViewType>(null)
  const onIndexChangeRef = useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange

  const resolvedStyles = useMemo(
    () => getPickerStyles(token, itemHeight, resolvedVisibleItemCount),
    [itemHeight, resolvedVisibleItemCount, token],
  )

  const clampOffset = useCallback(
    (value: number) =>
      Math.min(maxIndex * itemHeight, Math.max(0, Number.isFinite(value) ? value : 0)),
    [itemHeight, maxIndex],
  )

  const scrollToIndex = useCallback(
    (requestedIndex: number, animated: boolean) => {
      const index = clampIndex(requestedIndex, maxIndex)
      const nextOffset = index * itemHeight
      offsetRef.current = nextOffset
      scrollIndexRef.current = index
      if (!animated) offset.setValue(nextOffset)
      scrollRef.current?.scrollTo({ y: nextOffset, animated })
    },
    [itemHeight, maxIndex, offset],
  )

  const settle = useCallback(
    (requestedOffset: number, animated: boolean) => {
      if (items.length === 0) return

      const clampedOffset = clampOffset(requestedOffset)
      const index = getSnapIndex(clampedOffset, itemHeight, maxIndex)
      const targetOffset = index * itemHeight
      const shouldAnimate = animated && Math.abs(clampedOffset - targetOffset) > MIN_OFFSET_EPSILON

      offsetRef.current = targetOffset
      scrollIndexRef.current = index
      if (!shouldAnimate) offset.setValue(targetOffset)
      scrollRef.current?.scrollTo({ y: targetOffset, animated: shouldAnimate })

      if (selectedIndexRef.current === index) return
      selectedIndexRef.current = index
      onIndexChangeRef.current?.(index)
    },
    [clampOffset, itemHeight, items.length, maxIndex, offset],
  )

  useEffect(() => {
    const nextIndex = items.length === 0 ? 0 : Math.min(maxIndex, Math.max(0, selectedIndex))
    const selectedIndexChanged = selectedIndexRef.current !== nextIndex
    const geometryChanged =
      itemHeightRef.current !== itemHeight || itemCountRef.current !== items.length
    const shouldScroll = !initializedRef.current || selectedIndexChanged || geometryChanged
    const shouldAnimate = initializedRef.current && selectedIndexChanged && !geometryChanged

    selectedIndexRef.current = nextIndex
    itemHeightRef.current = itemHeight
    itemCountRef.current = items.length
    if (shouldScroll) {
      scrollIndexRef.current = nextIndex
      scrollToIndex(nextIndex, shouldAnimate)
    }
    initializedRef.current = true
  }, [itemHeight, items.length, maxIndex, scrollToIndex, selectedIndex])

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextOffset = clampOffset(event.nativeEvent.contentOffset.y)
      offsetRef.current = nextOffset
      scrollIndexRef.current = itemHeight > 0 ? nextOffset / itemHeight : 0
      offset.setValue(offsetRef.current)
    },
    [clampOffset, itemHeight, offset],
  )

  const handleScrollEnd = useCallback(() => {
    settle(offsetRef.current, true)
  }, [settle])

  const handleItemPress = useCallback(
    (index: number) => {
      scrollToIndex(index, true)
      const nextIndex = clampIndex(index, maxIndex)
      if (selectedIndexRef.current === nextIndex) return

      selectedIndexRef.current = nextIndex
      onIndexChangeRef.current?.(nextIndex)
    },
    [maxIndex, scrollToIndex],
  )

  return (
    <View ref={ref} style={[resolvedStyles.column, style]} testID={testID}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: topInset, paddingBottom: topInset }}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollsToTop={false}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={itemHeight}
        style={{ height: resolvedStyles.view.height } as ViewStyle}
        testID={testID ? `${testID}-scroll` : `picker-column-${columnIndex}-scroll`}
      >
        {items.map((item, index) => {
          const inputRange = [
            (index - 2) * itemHeight,
            (index - 1) * itemHeight,
            index * itemHeight,
            (index + 1) * itemHeight,
            (index + 2) * itemHeight,
          ]
          const opacity = offset.interpolate({
            inputRange,
            outputRange: [
              token.picker_item_inactive_opacity,
              Math.min(1, token.picker_item_inactive_opacity + 0.35),
              1,
              Math.min(1, token.picker_item_inactive_opacity + 0.35),
              token.picker_item_inactive_opacity,
            ],
            extrapolate: 'clamp',
          })
          const scale = offset.interpolate({
            inputRange,
            outputRange: [
              token.picker_item_inactive_scale,
              Math.min(1, token.picker_item_inactive_scale + 0.05),
              1,
              Math.min(1, token.picker_item_inactive_scale + 0.05),
              token.picker_item_inactive_scale,
            ],
            extrapolate: 'clamp',
          })
          const translateY = offset.interpolate({
            inputRange,
            outputRange: [
              token.picker_item_translate_y,
              token.picker_item_translate_y / 2,
              0,
              -token.picker_item_translate_y / 2,
              -token.picker_item_translate_y,
            ],
            extrapolate: 'clamp',
          })

          return (
            <InteractionPressable
              accessibilityRole="radio"
              accessibilityState={{ selected: index === selectedIndex }}
              key={`${String(item.value)}-${index}`}
              onPress={() => handleItemPress(index)}
              style={[resolvedStyles.item, itemStyle]}
              testID={`picker-item-${columnIndex}-${index}`}
            >
              <Animated.Text
                numberOfLines={1}
                style={[
                  resolvedStyles.itemLabel,
                  itemLabelStyle,
                  {
                    color:
                      index === selectedIndex
                        ? token.picker_active_text_color
                        : token.picker_text_color,
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                {item.text}
              </Animated.Text>
            </InteractionPressable>
          )
        })}
      </Animated.ScrollView>
    </View>
  )
})

PickerColumn.displayName = 'PickerColumn'
