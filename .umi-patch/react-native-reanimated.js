import React, { useMemo, useRef } from 'react'
import { View, Text, Image, ScrollView, FlatList } from 'react-native-web'

function useSharedValue(initialValue) {
  const valueRef = useRef(initialValue)
  return useMemo(() => {
    const sharedValue = {
      get: () => valueRef.current,
      set: (next) => {
        valueRef.current = typeof next === 'function' ? next(valueRef.current) : next
      },
    }
    Object.defineProperty(sharedValue, 'value', {
      configurable: true,
      get: () => valueRef.current,
      set: (next) => {
        valueRef.current = next
      },
    })
    return sharedValue
  }, [])
}

export function useAnimatedStyle(updater) {
  return updater()
}

export function useDerivedValue(updater) {
  return useSharedValue(updater())
}

export function useAnimatedRef() {
  return useRef(null)
}

export function measure(ref) {
  const node = ref?.current
  if (!node || typeof node.getBoundingClientRect !== 'function') return null

  const rect = node.getBoundingClientRect()
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    pageX: rect.x,
    pageY: rect.y,
  }
}

export const runOnUI = (callback) => callback

export function createAnimatedComponent(Component) {
  return Component
}

const linear = (value) => value

export const Easing = {
  ease: linear,
  in: (easing) => easing,
  inOut: () => (value) => value * value * (3 - 2 * value),
  linear,
  out: (easing) => easing,
}

export { useSharedValue }
function complete(callback) {
  if (callback) Promise.resolve().then(() => callback(true))
}

export const withSpring = (value, _config, callback) => {
  complete(callback)
  return value
}
export const withTiming = (value, _config, callback) => {
  complete(callback)
  return value
}
export const withDelay = (_delay, animation) => animation
export const withRepeat = (animation, _numberOfReps, _reverse) => animation
export const withSequence = (...animations) => animations[animations.length - 1]
export const cancelAnimation = () => undefined
export const runOnJS = (callback) => callback

const Animated = {
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
  createAnimatedComponent: (Component) => Component,
}

export default Animated
