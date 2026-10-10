import React, { useMemo, useRef } from 'react'
import { View, Text, Image, ScrollView, FlatList, Easing } from 'react-native-web'
import { FastColor } from '@ant-design/fast-color'

export const ReduceMotion = { System: 'system', Always: 'always', Never: 'never' }

export function interpolateColor(value, range, colors) {
  const progress = Math.min(1, Math.max(0, (value - range[0]) / (range[1] - range[0])))
  return new FastColor(colors[0]).mix(colors[1], progress * 100).toRgbString()
}

function useSharedValue(initialValue) {
  const valueRef = useRef(initialValue)
  return useMemo(() => {
    const sharedValue = {
      __tsukiStaticAdapter: true,
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

export function useAnimatedReaction(prepare, react) {
  const value = prepare()
  react(value, null)
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

export { Easing, useSharedValue }
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
