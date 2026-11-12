import { ReduceMotion } from 'react-native-reanimated'
import { useCallback, useEffect, useRef } from 'react'
import type { LayoutChangeEvent, View as ViewComponent } from 'react-native'
import {
  cancelAnimation,
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { animateValue } from './animation'
import { LAYOUT_PRESET } from './presets'
import { useMotionConfig } from './useMotionConfig'

export function useCollapseMotion(active: boolean, requestedDuration: number) {
  const contentRef = useAnimatedRef<ViewComponent>()
  const height = useSharedValue(0)
  const contentHeight = useSharedValue(0)
  const isAnimating = useSharedValue(false)
  const pendingExpansion = useSharedValue(false)
  const expandedProgress = useSharedValue(active ? 1 : 0)
  const hasMeasured = useSharedValue(false)
  const didMount = useRef(false)
  const policy = useMotionConfig()
  const duration = policy.duration(requestedDuration)

  const measureContent = useCallback(
    (event: LayoutChangeEvent) => {
      const fallbackHeight = event.nativeEvent.layout.height
      runOnUI((shouldExpand: boolean, fallback: number) => {
        'worklet'

        const measured = measure(contentRef)
        const nextHeight = measured?.height ?? fallback
        if (!Number.isFinite(nextHeight) || nextHeight < 0) return

        const isFirstMeasurement = !hasMeasured.value
        const shouldAnimateOpening = isFirstMeasurement && pendingExpansion.value && shouldExpand
        contentHeight.value = nextHeight
        hasMeasured.value = true

        if (shouldAnimateOpening) {
          pendingExpansion.value = false
          isAnimating.value = true
          height.value = animateValue(
            nextHeight,
            { ...LAYOUT_PRESET, duration, reduceMotion: ReduceMotion.Never },
            (finished) => {
              if (finished) isAnimating.value = false
            },
          )
        } else if (isFirstMeasurement) {
          height.value = shouldExpand ? nextHeight : 0
        } else if (shouldExpand && height.value !== nextHeight) {
          isAnimating.value = duration > 0
          height.value =
            duration > 0
              ? animateValue(
                  nextHeight,
                  { ...LAYOUT_PRESET, duration, reduceMotion: ReduceMotion.Never },
                  (finished) => {
                    if (finished) isAnimating.value = false
                  },
                )
              : nextHeight
        }
      })(active, fallbackHeight)
    },
    [
      active,
      contentHeight,
      contentRef,
      duration,
      hasMeasured,
      height,
      isAnimating,
      pendingExpansion,
    ],
  )

  useEffect(() => {
    const immediate = !didMount.current
    didMount.current = true

    runOnUI((shouldExpand: boolean, setImmediately: boolean) => {
      'worklet'

      const targetHeight = shouldExpand ? contentHeight.value : 0
      const timingConfig = { ...LAYOUT_PRESET, duration, reduceMotion: ReduceMotion.Never }

      if (setImmediately || duration === 0) {
        pendingExpansion.value = false
        isAnimating.value = false
        height.value = targetHeight
        expandedProgress.value = shouldExpand ? 1 : 0
        return
      }

      if (!hasMeasured.value && shouldExpand) {
        pendingExpansion.value = true
        height.value = 0
      } else {
        pendingExpansion.value = false
        isAnimating.value = true
        height.value = animateValue(targetHeight, timingConfig, (finished) => {
          if (finished) isAnimating.value = false
        })
      }

      expandedProgress.value = animateValue(shouldExpand ? 1 : 0, timingConfig)
    })(active, immediate)
  }, [
    active,
    contentHeight,
    duration,
    expandedProgress,
    hasMeasured,
    height,
    isAnimating,
    pendingExpansion,
  ])

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: expandedProgress.value,
  }))
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${90 - expandedProgress.value * 180}deg` }],
  }))

  useEffect(
    () => () => {
      runOnUI(() => {
        'worklet'
        cancelAnimation(height)
        cancelAnimation(expandedProgress)
      })()
    },
    [expandedProgress, height],
  )
  return { contentRef, measureContent, animatedHeightStyle, animatedArrowStyle }
}
