import { useCallback, useEffect, useRef, useState } from 'react'
import type { LayoutChangeEvent, View } from 'react-native'
import { useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated'
import { LAYOUT_PRESET } from './presets'
import { useMotionValue } from './useMotionValue'

/** Web layout events trigger a render, including the static documentation adapter. */
export function useCollapseMotion(active: boolean, requestedDuration: number) {
  const contentRef = useAnimatedRef<View>()
  const [contentHeight, setContentHeight] = useState<number | null>(null)
  const hasMeasured = useRef(false)
  const target = active ? (contentHeight ?? 0) : 0
  const config = { ...LAYOUT_PRESET, duration: hasMeasured.current ? requestedDuration : 0 }
  const height = useMotionValue(target, config)
  const expandedProgress = useMotionValue(active ? 1 : 0, config)
  const measureContent = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height
    if (Number.isFinite(next) && next >= 0) setContentHeight(next)
  }, [])
  useEffect(() => {
    if (contentHeight !== null) hasMeasured.current = true
  }, [contentHeight])
  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: expandedProgress.value,
  }))
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${90 - expandedProgress.value * 180}deg` }],
  }))
  return { contentRef, measureContent, animatedHeightStyle, animatedArrowStyle }
}
