import { Icon } from '../icon'
import { memo, useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import type { ColorValue, ViewProps } from 'react-native'

export interface LoadingIconProps extends ViewProps {
  size: number
  color: ColorValue
  duration: number
  active?: boolean
}

function LoadingIconComponent({
  size,
  color,
  duration,
  active = true,
  ...props
}: LoadingIconProps) {
  const rotation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    rotation.stopAnimation()
    rotation.setValue(0)

    if (!active) return

    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    animation.start()

    return () => {
      animation.stop()
      rotation.stopAnimation()
      rotation.setValue(0)
    }
  }, [active, duration, rotation])

  return (
    <Animated.View
      {...props}
      style={[
        {
          width: size,
          height: size,
          transform: [
            {
              rotateZ: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
        props.style,
      ]}
    >
      <Icon name="LoadingOutlined" size={size} color={color} />
    </Animated.View>
  )
}

export const LoadingIcon = memo(LoadingIconComponent)
export default LoadingIcon
