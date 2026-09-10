import { forwardRef, memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { InteractionPressable } from '../interaction'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { getPickerStyles } from './styles'
import { getPickerToken } from './token'
import { findNearestEnabledIndex } from './usePicker'
import type { PickerOption } from './types'
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as ScrollViewType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native'

const AnimatedText = Animated.createAnimatedComponent(Text)

function getPickerOptionKey(value: PickerOption['value']) {
  return `${typeof value}:${String(value)}`
}

const PICKER_MOMENTUM_VELOCITY_EPSILON = 0.05

interface PickerColumnItemProps {
  item: PickerOption
  index: number
  itemStyle?: StyleProp<ViewStyle>
  itemLabelStyle?: StyleProp<TextStyle>
  columnIndex: number
  selectedIndex: number
  scrollOffset: ReturnType<typeof useSharedValue<number>>
  itemHeight: number
  inactiveOpacity: number
  inactiveScale: number
  translateY: number
  token: ReturnType<typeof getPickerToken>
  resolvedStyles: ReturnType<typeof getPickerStyles>
  onPress: (index: number) => void
}

const PickerColumnItem = memo(function PickerColumnItem({
  item,
  index,
  itemStyle,
  itemLabelStyle,
  columnIndex,
  selectedIndex,
  scrollOffset,
  itemHeight,
  inactiveOpacity,
  inactiveScale,
  translateY,
  token,
  resolvedStyles,
  onPress,
}: PickerColumnItemProps) {
  const animatedLabelStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * itemHeight,
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
      (index + 2) * itemHeight,
    ]
    const adjacentOpacity = Math.min(1, inactiveOpacity + 0.35)
    const adjacentScale = Math.min(1, inactiveScale + 0.05)

    return {
      opacity: interpolate(
        scrollOffset.value,
        inputRange,
        [inactiveOpacity, adjacentOpacity, 1, adjacentOpacity, inactiveOpacity],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            inputRange,
            [translateY, translateY / 2, 0, -translateY / 2, -translateY],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            inputRange,
            [inactiveScale, adjacentScale, 1, adjacentScale, inactiveScale],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }
  }, [index, inactiveOpacity, inactiveScale, itemHeight, scrollOffset, translateY])

  return (
    <InteractionPressable
      accessibilityRole="radio"
      accessibilityState={{ disabled: item.disabled, selected: index === selectedIndex }}
      disabled={item.disabled}
      onPress={() => onPress(index)}
      style={[resolvedStyles.item, itemStyle]}
      testID={`picker-item-${columnIndex}-${index}`}
    >
      <AnimatedText
        numberOfLines={1}
        style={[
          resolvedStyles.itemLabel,
          itemLabelStyle,
          {
            color: item.disabled
              ? token.picker_disabled_text_color
              : index === selectedIndex
                ? token.picker_active_text_color
                : token.picker_text_color,
          },
          animatedLabelStyle,
        ]}
      >
        {item.text}
      </AnimatedText>
    </InteractionPressable>
  )
})

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
  const bottomInset = topInset
  const maxIndex = Math.max(0, items.length - 1)
  const nextIndex = selectedIndex < 0 ? -1 : findNearestEnabledIndex(items, selectedIndex)
  const initialIndex = Math.max(0, nextIndex)
  const scrollRef = useRef<ScrollViewType>(null)
  const scrollOffset = useSharedValue(initialIndex * itemHeight)
  const currentIndexRef = useRef(initialIndex)
  const programmaticSettleRef = useRef<number | null>(null)
  const onIndexChangeRef = useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange

  const resolvedStyles = useMemo(
    () => getPickerStyles(token, itemHeight, resolvedVisibleItemCount),
    [itemHeight, resolvedVisibleItemCount, token],
  )
  const optionKeys = useMemo(() => {
    const occurrences = new Map<string, number>()
    return items.map((item) => {
      const baseKey = getPickerOptionKey(item.value)
      const occurrence = occurrences.get(baseKey) ?? 0
      occurrences.set(baseKey, occurrence + 1)
      return `${baseKey}:${occurrence}`
    })
  }, [items])

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      scrollRef.current?.scrollTo({ y: Math.max(0, index * itemHeight), animated })
    },
    [itemHeight],
  )

  const settle = useCallback(
    (offset: number, animated: boolean) => {
      const snapped = Math.min(maxIndex, Math.max(0, Math.round(offset / itemHeight)))
      const target = findNearestEnabledIndex(items, snapped)
      if (target < 0) return
      const targetOffset = target * itemHeight
      const needsCorrection = Math.abs(offset - targetOffset) > 0.5
      if (target !== currentIndexRef.current) {
        currentIndexRef.current = target
        if (needsCorrection) {
          programmaticSettleRef.current = target
          scrollToIndex(target, animated)
        }
        onIndexChangeRef.current?.(target)
      } else if (needsCorrection) {
        programmaticSettleRef.current = target
        scrollToIndex(target, animated)
      }
    },
    [itemHeight, items, maxIndex, scrollToIndex],
  )

  useLayoutEffect(() => {
    if (nextIndex < 0 || currentIndexRef.current === nextIndex) return
    currentIndexRef.current = nextIndex
    scrollOffset.value = nextIndex * itemHeight
    scrollToIndex(nextIndex, false)
  }, [itemHeight, items.length, nextIndex, scrollOffset, scrollToIndex])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y
    },
  })
  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      programmaticSettleRef.current = null
      const velocityY = Math.abs(event.nativeEvent.velocity?.y ?? 0)
      if (velocityY <= PICKER_MOMENTUM_VELOCITY_EPSILON) {
        settle(event.nativeEvent.contentOffset.y, true)
      }
    },
    [settle],
  )
  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (programmaticSettleRef.current !== null) {
        programmaticSettleRef.current = null
        return
      }
      settle(event.nativeEvent.contentOffset.y, true)
    },
    [settle],
  )
  const handlePress = useCallback(
    (index: number) => {
      if (items[index]?.disabled) return
      if (index === currentIndexRef.current) return
      currentIndexRef.current = index
      programmaticSettleRef.current = index
      scrollToIndex(index, true)
      onIndexChangeRef.current?.(index)
    },
    [items, scrollToIndex],
  )

  return (
    <View ref={ref} style={[resolvedStyles.column, style]} testID={testID}>
      <Animated.ScrollView
        ref={scrollRef}
        contentOffset={{ x: 0, y: initialIndex * itemHeight }}
        contentContainerStyle={{ paddingBottom: bottomInset, paddingTop: topInset }}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={scrollHandler}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={itemHeight}
        testID={testID ? `${testID}-viewport` : undefined}
      >
        {items.map((item, index) => (
          <PickerColumnItem
            columnIndex={columnIndex}
            index={index}
            item={item}
            itemLabelStyle={itemLabelStyle}
            itemHeight={itemHeight}
            itemStyle={itemStyle}
            inactiveOpacity={token.picker_item_inactive_opacity}
            inactiveScale={token.picker_item_inactive_scale}
            key={optionKeys[index]}
            onPress={handlePress}
            resolvedStyles={resolvedStyles}
            scrollOffset={scrollOffset}
            selectedIndex={nextIndex}
            token={token}
            translateY={token.picker_item_translate_y}
          />
        ))}
      </Animated.ScrollView>
    </View>
  )
})

PickerColumn.displayName = 'PickerColumn'
