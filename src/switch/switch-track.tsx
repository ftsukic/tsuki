import { useState } from 'react'
import { StyleSheet } from 'react-native'
import type { ColorValue, ViewStyle } from 'react-native'
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { Loading } from '../loading'
import type { SwitchToken } from '../theme'
import type { SwitchResolvedStyles } from './style'
import type { SwitchSemanticStyles } from './types'

interface SwitchTrackProps {
  active: boolean
  loading: boolean
  token: SwitchToken
  activeColor?: ColorValue
  inactiveColor?: ColorValue
  resolved: SwitchResolvedStyles
  semantic?: SwitchSemanticStyles
  translateProgress: SharedValue<number>
  trackProgress: SharedValue<number>
}

/** Private visual region; the public interaction remains on Switch's root. */
export function SwitchTrack({
  active,
  loading,
  token,
  activeColor,
  inactiveColor,
  resolved,
  semantic,
  translateProgress,
  trackProgress,
}: SwitchTrackProps) {
  const track = StyleSheet.flatten([resolved.track, semantic?.track])
  const indicator = StyleSheet.flatten([resolved.thumb, semantic?.indicator])
  const backgroundOverride = StyleSheet.flatten(semantic?.track)?.backgroundColor
  const activeTrackColor = activeColor ?? token.activeColor
  const inactiveTrackColor = inactiveColor ?? token.inactiveColor
  const fallbackColor = active ? activeTrackColor : inactiveTrackColor
  const [trackWidth, setTrackWidth] = useState<number>()
  const [thumbLayout, setThumbLayout] = useState<{ x: number; width: number }>()
  const width =
    trackWidth ?? (typeof track.width === 'number' ? track.width : Number(resolved.track.width))
  const thumbWidth =
    thumbLayout?.width ??
    (typeof indicator.width === 'number' ? indicator.width : Number(resolved.thumb.width))
  const thumbLeft =
    thumbLayout?.x ?? (typeof indicator.left === 'number' ? indicator.left : token.thumbInset)
  const translateX = Math.max(0, width - thumbLeft - thumbWidth - token.thumbInset)
  const baseTransform = indicator.transform
  const animatedTrackStyle = useAnimatedStyle(() => ({
    // Animated styles outrank static styles on native, regardless of array order.
    backgroundColor:
      backgroundOverride ??
      (typeof activeTrackColor === 'string' && typeof inactiveTrackColor === 'string'
        ? interpolateColor(trackProgress.value, [0, 1], [inactiveTrackColor, activeTrackColor])
        : fallbackColor),
  }))
  const animatedThumbStyle = useAnimatedStyle<ViewStyle>(() => {
    const offset = translateProgress.value * translateX
    return {
      transform:
        typeof baseTransform === 'string'
          ? `translateX(${offset}px) ${baseTransform}`
          : [{ translateX: offset }, ...(baseTransform ?? [])],
    }
  })

  return (
    <Animated.View
      testID="switch-track"
      onLayout={({ nativeEvent: { layout } }) => setTrackWidth(layout.width)}
      style={[track, animatedTrackStyle]}
    >
      <Animated.View
        testID="switch-thumb"
        onLayout={({ nativeEvent: { layout } }) => {
          setThumbLayout((previous) =>
            previous?.x === layout.x && previous.width === layout.width
              ? previous
              : { x: layout.x, width: layout.width },
          )
        }}
        style={[indicator, animatedThumbStyle]}
      >
        {loading ? (
          <Loading
            color={active ? activeTrackColor : (inactiveColor ?? token.loadingColor)}
            size={Math.max(1, thumbWidth * 0.6)}
            style={[resolved.loading, semantic?.loading]}
          />
        ) : null}
      </Animated.View>
    </Animated.View>
  )
}
