import type { ReactNode } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { resolveActionOffset } from './action-offset'
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
  const x = useSharedValue(0)
  const width = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: resolveActionOffset(
          translation.value,
          totalWidth.value,
          x.value,
          width.value,
          side,
        ),
      },
    ],
  }))
  const handleLayout = (event: LayoutChangeEvent) => {
    x.value = event.nativeEvent.layout.x
    width.value = event.nativeEvent.layout.width
  }
  return (
    <Animated.View
      onLayout={handleLayout}
      style={[{ alignSelf: 'stretch', flexDirection: 'row', zIndex: layer }, style]}
    >
      {children}
    </Animated.View>
  )
}
