import type { ReactNode } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { MOTION_PRESETS } from '../../motion/presets'
import type { OverlayEntry, OverlayRegistry } from '../types'
import { useOverlayTransition } from './use-overlay-transition'
import { resolveOverlayTransition } from './presets'
import { createTransitionStyle } from './transition-style'

export function OverlayEntryTransition({
  entry,
  registry,
}: {
  entry: OverlayEntry
  registry: OverlayRegistry
}) {
  const { width, height } = useWindowDimensions()
  const progress = useOverlayTransition(entry, registry)
  const config = resolveOverlayTransition(entry.transition)
  const maskPreset = config.mask ? MOTION_PRESETS[config.mask.preset] : null
  const contentPreset = MOTION_PRESETS[config.content.preset]
  const stage = entry.phase === 'exiting' ? 'exit' : 'enter'
  const maskStyle = useAnimatedStyle(
    () =>
      maskPreset
        ? createTransitionStyle(progress.maskProgress.get(), maskPreset, width, height, stage)
        : {},
    [height, maskPreset, stage, width],
  )
  const contentStyle = useAnimatedStyle(
    () =>
      createTransitionStyle(progress.contentProgress.get(), contentPreset, width, height, stage),
    [contentPreset, height, stage, width],
  )
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
      <Animated.View pointerEvents="box-none" style={[styles.channel, contentStyle]}>
        {entry.content}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill },
  channel: { ...StyleSheet.absoluteFill },
})
