import { Easing } from 'react-native-reanimated'

export function easeIn(value: number) {
  'worklet'
  return value * value * value
}

export function easeOut(value: number) {
  'worklet'
  return 1 - (1 - value) ** 3
}

// Match Reanimated's default timing curve in the documentation preview too.
export function easeInOut(value: number) {
  'worklet'
  return value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2
}

export const MOTION_EASING = {
  standard: easeInOut,
  enter: easeOut,
  exit: easeIn,
  overlayEnter: Easing.out(Easing.ease),
  overlayExit: Easing.in(Easing.ease),
  linear: (value: number) => {
    'worklet'
    return value
  },
}
