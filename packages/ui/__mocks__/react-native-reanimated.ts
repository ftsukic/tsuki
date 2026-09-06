import { Animated } from 'react-native'

export default Animated
export const useAnimatedStyle = (factory: () => unknown) => factory()
export const useSharedValue = <T>(value: T) => ({ value })
export const withTiming = <T>(value: T) => value
