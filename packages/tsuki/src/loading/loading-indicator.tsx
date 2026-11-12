import Animated from 'react-native-reanimated'
import { useFeedbackMotion } from '../motion/useFeedbackMotion'
import { memo } from 'react'
import { View } from 'react-native'
import type { ColorValue } from 'react-native'
import { Circle, Svg } from 'react-native-svg'
import type { LoadingType } from './types'

interface LoadingIndicatorProps {
  type: LoadingType
  size: number
  color: ColorValue
  duration: number
  motion: boolean
}

function CircularIndicator({ size, color }: Pick<LoadingIndicatorProps, 'size' | 'color'>) {
  const strokeWidth = Math.max(1, size / 10)
  const radius = Math.max(0, (size - strokeWidth) / 2)
  const circumference = 2 * Math.PI * radius
  const gap = circumference * 0.28

  return (
    <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={radius}
        stroke={color}
        strokeDasharray={`${circumference - gap} ${gap}`}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  )
}

function SpinnerIndicator({ size, color }: Pick<LoadingIndicatorProps, 'size' | 'color'>) {
  const segmentCount = 8
  const segmentWidth = Math.max(1, size * 0.11)
  const segmentHeight = Math.max(2, size * 0.28)

  return (
    <View style={{ height: size, width: size }}>
      {Array.from({ length: segmentCount }, (_, index) => (
        <View
          key={index}
          style={{
            height: size,
            left: 0,
            position: 'absolute',
            top: 0,
            transform: [{ rotate: `${index * (360 / segmentCount)}deg` }],
            width: size,
          }}
        >
          <View
            style={{
              backgroundColor: color,
              borderRadius: segmentWidth / 2,
              height: segmentHeight,
              left: (size - segmentWidth) / 2,
              opacity: Math.max(0.25, 1 - index * 0.1),
              position: 'absolute',
              top: 0,
              width: segmentWidth,
            }}
          />
        </View>
      ))}
    </View>
  )
}

function LoadingIndicatorComponent({ type, size, color, duration, motion }: LoadingIndicatorProps) {
  const animatedStyle = useFeedbackMotion('spin', duration, motion)

  return (
    <Animated.View style={[{ height: size, width: size }, animatedStyle]}>
      {type === 'circular' ? (
        <CircularIndicator color={color} size={size} />
      ) : (
        <SpinnerIndicator color={color} size={size} />
      )}
    </Animated.View>
  )
}

export const LoadingIndicator = memo(LoadingIndicatorComponent)
LoadingIndicator.displayName = 'LoadingIndicator'
