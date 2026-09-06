import { usePersistFn } from '../hooks'
import { useToken } from '../theme'
import type { CircularProgressProps } from './interface'
import { memo, useEffect, useRef } from 'react'
import { Animated, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

/** Render a circular progress indicator. */
export function CircularProgress({
  testID,
  theme,
  percentage = 0,
  size = 80,
  strokeWidth,
  color,
  trackColor,
  pivotText,
  textColor,
  inactive = false,
  showPivot = true,
  animated = false,
  animationDuration,
  onAnimationEnd,
}: CircularProgressProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Progress, ...theme }
  const resolvedStrokeWidth = strokeWidth ?? token.height
  const resolvedColor = inactive ? token.inactiveColor : (color ?? token.color)
  const resolvedTrackColor = trackColor ?? token.backgroundColor
  const resolvedTextColor = textColor ?? token.pivotTextColor
  const resolvedPivotText = pivotText ?? `${percentage}%`
  const value = useRef(new Animated.Value(0)).current
  const radius = Math.max(0, (size - resolvedStrokeWidth) / 2)
  const circumference = 2 * Math.PI * radius
  const onEnd = usePersistFn((finished: boolean) => {
    if (finished) onAnimationEnd?.(percentage)
  })

  useEffect(() => {
    const action = Animated.timing(value, {
      toValue: Math.max(0, Math.min(100, percentage)),
      duration: animated ? (animationDuration ?? themeToken.motionDurationMid) : 0,
      useNativeDriver: false,
    })
    action.start(({ finished }) => onEnd(Boolean(finished)))
    return () => action.stop()
  }, [animated, animationDuration, onEnd, percentage, themeToken.motionDurationMid, value])

  const strokeDashoffset = value.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  })

  return (
    <View
      testID={testID}
      style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedTrackColor}
          strokeWidth={resolvedStrokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={resolvedStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showPivot ? (
        <Text
          style={{
            position: 'absolute',
            color: resolvedTextColor,
            fontSize: token.pivotFontSize,
            lineHeight: token.pivotLineHeight * token.pivotFontSize,
          }}
        >
          {resolvedPivotText}
        </Text>
      ) : null}
    </View>
  )
}

export default memo(CircularProgress)
