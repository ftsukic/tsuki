import { memo, useEffect, useRef } from 'react'
import { Animated, Easing, Platform, View } from 'react-native'
import type { ColorValue } from 'react-native'
import { Circle, Svg } from 'react-native-svg'
import type { LoadingType } from './interface'

interface LoadingIndicatorProps {
  type: LoadingType
  size: number
  color: ColorValue
  duration: number
  motion: boolean
}

function toColorString(color: ColorValue): string {
  return typeof color === 'string' ? color : String(color)
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
        stroke={toColorString(color)}
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
  const segmentColor = toColorString(color)

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
              backgroundColor: segmentColor,
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
  const rotation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    rotation.stopAnimation()
    rotation.setValue(0)

    if (!motion || duration <= 0) return

    const animation = Animated.loop(
      Animated.timing(rotation, {
        duration,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
      }),
    )
    animation.start()

    return () => {
      animation.stop()
      rotation.stopAnimation()
      rotation.setValue(0)
    }
  }, [duration, motion, rotation])

  return (
    <Animated.View
      style={{
        height: size,
        transform: [
          {
            rotateZ: rotation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
        width: size,
      }}
    >
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
