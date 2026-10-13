import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import type { ReactNode } from 'react'
import type { DimensionValue, LayoutChangeEvent, StyleProp, TextStyle } from 'react-native'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { useMotionConfig } from '../motion/useMotionConfig'
import { ProgressCircle } from './progress-circle'
import type { ProgressProps } from './types'
import { getProgressStyles } from './style'
import { getProgressToken } from './token'

function normalizePercentage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value as number))
}

function resolvePositiveNumber(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback
}

function renderPivot(value: ReactNode, style: StyleProp<TextStyle>) {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }

  return value
}

function ProgressComponent({
  color,
  percentage = 0,
  pivotColor,
  pivotText,
  showPivot = true,
  size,
  strokeLinecap = 'round',
  strokeWidth,
  style,
  styles,
  trackColor,
  type = 'line',
  ...viewProps
}: ProgressProps) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Progress', getProgressToken)
  const motion = useMotionConfig()
  const normalizedPercentage = normalizePercentage(percentage)
  const resolvedSize = resolvePositiveNumber(size, token.progress_circle_size)
  const resolvedStrokeWidth = resolvePositiveNumber(
    strokeWidth,
    type === 'circle' ? token.progress_circle_stroke_width : token.progress_height,
  )
  const progress = useRef(new Animated.Value(normalizedPercentage)).current
  const previousPercentage = useRef(normalizedPercentage)
  const [animatedPercentage, setAnimatedPercentage] = useState(normalizedPercentage)
  const resolvedPivotText = pivotText ?? `${normalizedPercentage}%`
  const [pivotWidth, setPivotWidth] = useState<number>()
  const [railWidth, setRailWidth] = useState<number>()
  const resolvedProps: ProgressProps = {
    ...viewProps,
    color,
    percentage: normalizedPercentage,
    pivotColor,
    pivotText,
    showPivot,
    size,
    strokeLinecap,
    strokeWidth,
    style,
    styles,
    trackColor,
    type,
  }
  const state = { percentage: normalizedPercentage, showPivot, type }
  const semantic = resolveStyles(styles, { props: resolvedProps, state })
  const resolved = getProgressStyles(
    token,
    { ...resolvedProps, size: resolvedSize, strokeWidth: resolvedStrokeWidth },
    state,
  )
  const animationDuration = motion.duration(token.progress_animation_duration)

  useEffect(() => {
    const listenerId = progress.addListener(({ value }) => {
      setAnimatedPercentage((current) => (current === value ? current : value))
    })

    return () => {
      progress.removeListener(listenerId)
    }
  }, [progress])

  useEffect(() => {
    const percentageChanged = previousPercentage.current !== normalizedPercentage
    previousPercentage.current = normalizedPercentage

    if (!percentageChanged || animationDuration <= 0) {
      progress.setValue(normalizedPercentage)
      return
    }

    const animation = Animated.timing(progress, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      toValue: normalizedPercentage,
      useNativeDriver: false,
    })
    animation.start()

    return () => {
      animation.stop()
    }
  }, [animationDuration, normalizedPercentage, previousPercentage, progress])

  const accessibilityValue = {
    max: 100,
    min: 0,
    now: normalizedPercentage,
  }

  const handlePivotLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width
    if (!Number.isFinite(width)) return
    setPivotWidth((current) => (current === width ? current : width))
  }

  const handleRailLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width
    if (!Number.isFinite(width) || width < 0) return
    setRailWidth((current) => (current === width ? current : width))
  }

  if (type === 'circle') {
    return (
      <View
        {...viewProps}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={accessibilityValue}
        style={[resolved.root, semantic?.root, style]}
      >
        <ProgressCircle
          circleStyle={[resolved.circle, semantic?.body]}
          color={color ?? token.progress_color}
          labelContainerStyle={semantic?.indicatorContainer}
          labelStyle={[resolved.circleLabel, semantic?.indicator]}
          percentage={animatedPercentage}
          pivotText={pivotText}
          showPivot={showPivot}
          size={resolvedSize}
          strokeLinecap={strokeLinecap}
          strokeWidth={resolvedStrokeWidth}
          trackColor={trackColor ?? token.progress_track_color}
        />
      </View>
    )
  }

  const portionWidth: DimensionValue = `${animatedPercentage}%`
  const pivotLeft: DimensionValue =
    railWidth === undefined || pivotWidth === undefined
      ? `${animatedPercentage}%`
      : Math.max(
          0,
          Math.min(railWidth - pivotWidth, (railWidth * animatedPercentage) / 100 - pivotWidth / 2),
        )

  return (
    <View
      {...viewProps}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={accessibilityValue}
      style={[resolved.root, semantic?.root, style]}
    >
      <View onLayout={handleRailLayout} style={[resolved.track, semantic?.rail]}>
        <View style={[resolved.portion, semantic?.track, { width: portionWidth }]} />
        {showPivot ? (
          <View
            onLayout={handlePivotLayout}
            pointerEvents="none"
            style={[
              resolved.pivot,
              semantic?.indicatorContainer,
              {
                position: 'absolute',
                top: resolved.pivot.top,
                left: pivotLeft,
                transform:
                  railWidth === undefined && pivotWidth !== undefined
                    ? [{ translateX: (-pivotWidth * animatedPercentage) / 100 }]
                    : undefined,
              },
            ]}
          >
            {renderPivot(resolvedPivotText, [
              {
                color: themeToken.colorTextLightSolid,
                fontSize: token.progress_pivot_font_size,
                lineHeight: token.progress_pivot_font_size + 4,
              },
              semantic?.indicator,
            ])}
          </View>
        ) : null}
      </View>
    </View>
  )
}

export const Progress = Object.assign(ProgressComponent, { displayName: 'Progress' })
