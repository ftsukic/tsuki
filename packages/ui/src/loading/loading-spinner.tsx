import { memo, useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import type { ColorValue, ViewProps } from 'react-native'

export interface SpinnerProps extends ViewProps {
  size: number
  color: ColorValue
  duration: number
}

function Spinner({ size, color, duration, ...props }: SpinnerProps) {
  const value = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    animation.start()
    return () => animation.stop()
  }, [duration, value])
  return (
    <Animated.View
      {...props}
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [
            { rotateZ: value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
          ],
        },
        props.style,
      ]}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            transform: [{ rotate: `${index * 45}deg` }],
            opacity: (index + 1) / 8,
          }}
        >
          <View style={{ width: 2, height: '30%', backgroundColor: color }} />
        </View>
      ))}
    </Animated.View>
  )
}

export default memo(Spinner)
