import { usePersistFn } from '../hooks'
import { useToken } from '../theme'
import CircularProgress from './circular-progress'
import type { ProgressProps } from './interface'
import { memo, useEffect, useRef, useState } from 'react'
import { Animated, Text, View } from 'react-native'

function ProgressBase({
  testID,
  theme,
  percentage = 0,
  strokeHeight,
  color,
  trackColor,
  pivotText,
  pivotColor,
  textColor,
  inactive = false,
  showPivot = true,
  square = false,
  animated = false,
  animationDuration,
  onAnimationEnd,
}: ProgressProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Progress, ...theme }
  const height = strokeHeight ?? token.height
  const resolvedColor = inactive ? token.inactiveColor : (color ?? token.color)
  const resolvedTrackColor = trackColor ?? token.backgroundColor
  const resolvedPivotColor = pivotColor ?? resolvedColor
  const resolvedTextColor = textColor ?? token.pivotTextColor
  const resolvedPivotText = pivotText ?? `${percentage}%`
  const value = useRef(new Animated.Value(0)).current
  const [width, setWidth] = useState(0)
  const [pivotWidth, setPivotWidth] = useState(0)
  const [pivotHeight, setPivotHeight] = useState(0)
  const onEnd = usePersistFn((finished: boolean) => {
    if (finished) onAnimationEnd?.(percentage)
  })

  useEffect(() => {
    const action = Animated.timing(value, {
      toValue: (width * Math.max(0, Math.min(100, percentage))) / 100,
      duration: animated ? (animationDuration ?? themeToken.motionDurationMid) : 0,
      useNativeDriver: false,
    })
    action.start(({ finished }) => onEnd(Boolean(finished)))
    return () => action.stop()
  }, [animated, animationDuration, onEnd, percentage, themeToken.motionDurationMid, value, width])

  return (
    <View
      testID={testID}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ height, backgroundColor: resolvedTrackColor, borderRadius: square ? 0 : height / 2 }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: value,
          height,
          backgroundColor: resolvedColor,
          borderRadius: square ? 0 : height / 2,
        }}
      />
      {showPivot ? (
        <Animated.View
          onLayout={(event) => {
            setPivotWidth(event.nativeEvent.layout.width)
            setPivotHeight(event.nativeEvent.layout.height)
          }}
          style={{
            position: 'absolute',
            left: value,
            top: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: resolvedPivotColor,
            paddingHorizontal: token.pivotPaddingHorizontal,
            borderRadius: height / 2,
            transform: [
              { translateX: -pivotWidth / 2 },
              { translateY: -(pivotHeight - height) / 2 },
            ],
          }}
        >
          <Text
            style={{
              color: resolvedTextColor,
              fontSize: token.pivotFontSize,
              lineHeight: token.pivotLineHeight * token.pivotFontSize,
            }}
          >
            {resolvedPivotText}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  )
}

/** Provide line and circular progress indicators through one component API. */
export const Progress = Object.assign(memo(ProgressBase), { Circle: CircularProgress })

export default Progress
