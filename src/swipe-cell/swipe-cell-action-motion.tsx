import { isValidElement, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { View, type LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { SwipeCellActionWidthContext } from './context'
import { resolveActionOffset, resolveActionWidth } from './action-offset'
import type { SwipeCellSide } from './types'

interface SwipeCellActionMotionProps {
  children: ReactNode
  side: SwipeCellSide
  translation: SharedValue<number>
  totalWidth: SharedValue<number>
  layer: number
}

export function SwipeCellActionMotion({
  children,
  side,
  translation,
  totalWidth,
  layer,
}: SwipeCellActionMotionProps) {
  const [measuredWidth, setMeasuredWidth] = useState<number>()
  const actionProps = isValidElement<{ width?: number; children?: ReactNode }>(children)
    ? children.props
    : undefined
  const declaredWidth = typeof actionProps?.width === 'number' ? actionProps.width : undefined
  const label =
    typeof actionProps?.children === 'string' || typeof actionProps?.children === 'number'
      ? actionProps.children
      : null
  const x = useSharedValue(0)
  const width = useSharedValue(0)
  useLayoutEffect(() => {
    width.value = 0
    setMeasuredWidth(undefined)
  }, [declaredWidth, label, width])
  const contentLayout = useMemo(
    () => (measuredWidth === undefined ? null : { width: measuredWidth, side }),
    [measuredWidth, side],
  )
  const style = useAnimatedStyle(() =>
    width.value > 0
      ? {
          opacity: 1,
          width: resolveActionWidth(translation.value, totalWidth.value, width.value, side),
          transform: [
            {
              translateX: resolveActionOffset(translation.value, totalWidth.value, x.value, side),
            },
          ],
        }
      : { opacity: 0 },
  )
  const handleLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout
    x.value = layout.x
    width.value = layout.width
    if (layout.width > 0) setMeasuredWidth(layout.width)
  }
  return (
    <View
      onLayout={handleLayout}
      style={{ width: measuredWidth, alignSelf: 'stretch', zIndex: layer }}
    >
      <Animated.View collapsable={false} style={[{ flex: 1, overflow: 'hidden' }, style]}>
        <SwipeCellActionWidthContext.Provider value={contentLayout}>
          {children}
        </SwipeCellActionWidthContext.Provider>
      </Animated.View>
    </View>
  )
}
