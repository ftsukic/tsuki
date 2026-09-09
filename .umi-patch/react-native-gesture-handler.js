import { View } from 'react-native-web'

export const GestureHandlerRootView = View

function createGesture() {
  const gesture = {
    activeOffsetX: () => gesture,
    activeOffsetY: () => gesture,
    enabled: () => gesture,
    failOffsetX: () => gesture,
    failOffsetY: () => gesture,
    minDistance: () => gesture,
    numberOfTaps: () => gesture,
    onBegin: () => gesture,
    onEnd: () => gesture,
    onFinalize: () => gesture,
    onStart: () => gesture,
    onUpdate: () => gesture,
  }

  return gesture
}

export const Gesture = {
  Pan: createGesture,
  Tap: createGesture,
}

export const GestureDetector = ({ children }) => children ?? null

export const State = {
  END: 5,
}
