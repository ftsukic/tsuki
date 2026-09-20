import { View } from 'react-native'
import { Circle, Svg } from 'react-native-svg'
import type { ColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native'
import { Text } from '../text'
import type { ReactNode } from 'react'

export interface ProgressCircleProps {
  color: ColorValue
  percentage: number
  pivotText: ReactNode
  showPivot: boolean
  size: number
  strokeLinecap: 'round' | 'square'
  strokeWidth: number
  trackColor: ColorValue
  circleStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
}

function toColorString(color: ColorValue): string {
  return typeof color === 'string' ? color : String(color)
}

function renderPivot(value: ReactNode, style: StyleProp<TextStyle>) {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }

  return value
}

export function ProgressCircle({
  circleStyle,
  color,
  labelStyle,
  percentage,
  pivotText,
  showPivot,
  size,
  strokeLinecap,
  strokeWidth,
  trackColor,
}: ProgressCircleProps) {
  const resolvedStrokeWidth = Math.min(Math.max(1, strokeWidth), size)
  const radius = Math.max(0, (size - resolvedStrokeWidth) / 2)
  const circumference = 2 * Math.PI * radius
  const normalizedPercentage = Math.min(100, Math.max(0, percentage))
  const offset = circumference * (1 - normalizedPercentage / 100)
  const resolvedPivotText = pivotText ?? `${Math.round(normalizedPercentage)}%`

  return (
    <View style={[{ position: 'relative' }, circleStyle]}>
      <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          originX={size / 2}
          originY={size / 2}
          r={radius}
          rotation={-90}
          stroke={toColorString(trackColor)}
          strokeLinecap={strokeLinecap}
          strokeWidth={resolvedStrokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          originX={size / 2}
          originY={size / 2}
          r={radius}
          rotation={-90}
          stroke={toColorString(color)}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap={strokeLinecap}
          strokeWidth={resolvedStrokeWidth}
        />
      </Svg>
      {showPivot ? (
        <View
          pointerEvents="none"
          style={{
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          {renderPivot(resolvedPivotText, labelStyle)}
        </View>
      ) : null}
    </View>
  )
}

ProgressCircle.displayName = 'ProgressCircle'
