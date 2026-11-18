import { useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, Platform } from 'react-native'
import type { KeyboardEvent, LayoutChangeEvent, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { keyboardAnimation } from '../motion/presets'
import { useMotionValue } from '../motion/useMotionValue'
import { getPopupKeyboardLayout } from './keyboard-layout'
import type { PopupPosition } from './types'

export function usePopupKeyboard(enabled: boolean, panelHeight: number, position: PopupPosition) {
  const hostRef = useRef<View>(null)
  const [host, setHost] = useState({ top: 0, height: 0 })
  const [keyboard, setKeyboard] = useState<{
    top?: number
    duration?: number
    easing?: KeyboardEvent['easing']
  }>({})
  const measurementVersion = useRef(0)

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout
    const version = ++measurementVersion.current
    setHost({ top: y, height })
    hostRef.current?.measureInWindow((_x, top, _width, measuredHeight) => {
      if (version === measurementVersion.current && measuredHeight > 0) {
        setHost({ top, height: measuredHeight })
      }
    })
  }, [])

  useEffect(() => {
    if (!enabled) return
    const metrics = Keyboard.metrics?.()
    setKeyboard(metrics ? { top: metrics.screenY } : {})
    const update = (event: KeyboardEvent) => {
      setKeyboard({
        top: event.endCoordinates.height > 0 ? event.endCoordinates.screenY : undefined,
        duration: event.duration,
        easing: event.easing,
      })
    }
    const hide = (event: KeyboardEvent) => {
      setKeyboard({ duration: event.duration, easing: event.easing })
    }
    const subscriptions = [
      Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', update),
      Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', hide),
      ...(Platform.OS === 'ios' ? [Keyboard.addListener('keyboardWillChangeFrame', update)] : []),
    ]
    return () => {
      measurementVersion.current += 1
      subscriptions.forEach((subscription) => subscription.remove())
    }
  }, [enabled])

  const layout = getPopupKeyboardLayout(
    host.top,
    host.height,
    panelHeight,
    enabled ? keyboard.top : undefined,
    position,
  )
  const offset = useMotionValue(
    enabled && layout.offset > 0 ? -layout.offset : 0,
    keyboardAnimation(keyboard.duration, keyboard.easing),
    0,
  )
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }))
  return { hostRef, onLayout, animatedStyle, ...layout, measured: host.height > 0 }
}
