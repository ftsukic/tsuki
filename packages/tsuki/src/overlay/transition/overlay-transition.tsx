import { useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { MOTION_PRESETS } from '../../motion/presets'
import type { OverlayEntry, OverlayRegistry } from '../types'
import { resolveOverlayTransition } from './presets'
import { OverlayTransitionContext } from './transition-context'
import { createTransitionStyle } from './transition-style'
import type { OverlayTransitionStage } from './types'
import { useOverlayTransition } from './use-overlay-transition'

export function OverlayEntryTransition({
  entry,
  registry,
}: {
  entry: OverlayEntry
  registry: OverlayRegistry
}) {
  const { width, height } = useWindowDimensions()
  const progress = useOverlayTransition(entry, registry)
  const measuredWidth = useSharedValue(0)
  const measuredHeight = useSharedValue(0)
  const localContentClaimed = useSharedValue(false)
  const config = resolveOverlayTransition(entry.transition)
  const maskPreset = config.mask ? MOTION_PRESETS[config.mask.preset] : null
  const contentPreset = MOTION_PRESETS[config.content.preset]
  const stage: OverlayTransitionStage = entry.phase === 'exiting' ? 'exit' : 'enter'

  const reportContentSize = useCallback(
    (nextWidth: number, nextHeight: number) => {
      if (nextWidth > 0 && measuredWidth.get() !== nextWidth) measuredWidth.set(nextWidth)
      if (nextHeight > 0 && measuredHeight.get() !== nextHeight) measuredHeight.set(nextHeight)
    },
    [measuredHeight, measuredWidth],
  )
  const setLocalContentTarget = useCallback(
    (claimed: boolean) => {
      if (localContentClaimed.get() !== claimed) localContentClaimed.set(claimed)
    },
    [localContentClaimed],
  )
  const transitionContext = useMemo(
    () => ({
      contentProgress: progress.contentProgress,
      stage,
      reportContentSize,
      setLocalContentTarget,
    }),
    [progress.contentProgress, reportContentSize, setLocalContentTarget, stage],
  )

  const maskStyle = useAnimatedStyle(() =>
    maskPreset
      ? createTransitionStyle(progress.maskProgress.get(), maskPreset, width, height, stage)
      : {},
  )
  const contentStyle = useAnimatedStyle(() => {
    if (localContentClaimed.get()) return { opacity: 1, transform: [] }
    const mw = measuredWidth.get()
    const mh = measuredHeight.get()
    return createTransitionStyle(
      progress.contentProgress.get(),
      contentPreset,
      mw > 0 ? mw : width,
      mh > 0 ? mh : height,
      stage,
    )
  })
  const hidden = entry.phase === 'hidden'
  const exiting = entry.phase === 'exiting'

  return (
    <View
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      pointerEvents={hidden || exiting ? 'none' : 'box-none'}
      style={styles.root}
    >
      {entry.mask !== undefined && entry.mask !== null ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.channel, maskPreset ? maskStyle : undefined]}
        >
          {entry.mask as ReactNode}
        </Animated.View>
      ) : null}
      <OverlayTransitionContext.Provider value={transitionContext}>
        <Animated.View pointerEvents="box-none" style={[styles.channel, contentStyle]}>
          {entry.content}
        </Animated.View>
      </OverlayTransitionContext.Provider>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill },
  channel: { ...StyleSheet.absoluteFill },
})
