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
  const offset = useRef(new Animated.Value(Math.max(0, selectedIndex) * itemHeight)).current
  const offsetRef = useRef(Math.max(0, selectedIndex) * itemHeight)
  const lastSettledIndexRef = useRef(Math.max(0, selectedIndex))
  const selectedIndexRef = useRef(Math.max(0, selectedIndex))
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
    (value: number) => Math.min(maxIndex * itemHeight, Math.max(0, value)),
    [itemHeight, maxIndex],
  )

  const scrollToIndex = useCallback(
    (requestedIndex: number, animated: boolean) => {
      const index = Math.min(maxIndex, Math.max(0, requestedIndex))
      const nextOffset = index * itemHeight
      offsetRef.current = nextOffset
      if (!animated) offset.setValue(nextOffset)
      scrollRef.current?.scrollTo({ y: nextOffset, animated })
    },
    [itemHeight, maxIndex, offset],
  )

  const settle = useCallback(
    (requestedOffset: number, animated: boolean) => {
      if (items.length === 0) return

      const clampedOffset = clampOffset(requestedOffset)
      const index = Math.min(maxIndex, Math.max(0, Math.round(clampedOffset / itemHeight)))
      const targetOffset = index * itemHeight
      const shouldAnimate = animated && Math.abs(clampedOffset - targetOffset) > MIN_OFFSET_EPSILON

      offsetRef.current = targetOffset
      if (!shouldAnimate) offset.setValue(targetOffset)
      if (shouldAnimate) scrollRef.current?.scrollTo({ y: targetOffset, animated: true })

      if (lastSettledIndexRef.current === index) return
      lastSettledIndexRef.current = index
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

    lastSettledIndexRef.current = nextIndex
    selectedIndexRef.current = nextIndex
    itemHeightRef.current = itemHeight
    itemCountRef.current = items.length
    if (shouldScroll) scrollToIndex(nextIndex, shouldAnimate)
    initializedRef.current = true
  }, [itemHeight, items.length, maxIndex, scrollToIndex, selectedIndex])

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = clampOffset(event.nativeEvent.contentOffset.y)
      offset.setValue(offsetRef.current)
    },
    [clampOffset, offset],
  )

  const handleScrollEnd = useCallback(() => {
    settle(offsetRef.current, true)
  }, [settle])

  const handleItemPress = useCallback(
    (index: number) => {
      scrollToIndex(index, true)
      if (lastSettledIndexRef.current === index) return

      lastSettledIndexRef.current = index
      selectedIndexRef.current = index
      onIndexChangeRef.current?.(index)
    },
    [scrollToIndex],
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
        onScrollEndDrag={handleScrollEnd}
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
              Math.min(1, token.picker_item_inactive_opacity + 0.25),
              1,
              Math.min(1, token.picker_item_inactive_opacity + 0.25),
              token.picker_item_inactive_opacity,
            ],
            extrapolate: 'clamp',
          })
          const scale = offset.interpolate({
            inputRange,
            outputRange: [
              token.picker_item_inactive_scale,
              Math.min(1, token.picker_item_inactive_scale + 0.04),
              1,
              Math.min(1, token.picker_item_inactive_scale + 0.04),
              token.picker_item_inactive_scale,
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
                    transform: [{ scale }],
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
