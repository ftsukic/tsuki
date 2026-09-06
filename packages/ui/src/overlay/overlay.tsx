import { useToken } from '../theme'
import type { OverlayProps } from './interface'
import { createOverlayStyles } from './style'
import { useEffect, useRef, useState } from 'react'
import { Animated, BackHandler, Pressable } from 'react-native'

export function OverlaySurface({
  children,
  visible,
  duration = 300,
  onPress,
  onRequestClose,
  backgroundColor,
  overlayStyle,
  style,
  zIndex,
  testID,
  onClosed,
  theme,
}: OverlayProps) {
  const { components } = useToken()
  const token = { ...components.Overlay, ...theme }
  const styles = createOverlayStyles(token)
  const opacity = useRef(new Animated.Value(0)).current
  const onClosedRef = useRef(onClosed)
  const mounted = useRef(false)
  const [rendered, setRendered] = useState(visible)

  useEffect(() => {
    onClosedRef.current = onClosed
  }, [onClosed])

  useEffect(() => {
    if (!mounted.current && !visible) {
      mounted.current = true
      return
    }
    mounted.current = true
    if (visible) setRendered(true)
    const animation = Animated.timing(opacity, {
      duration,
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    })
    animation.start(({ finished }) => {
      if (finished && !visible) {
        setRendered(false)
        onClosedRef.current?.()
      }
    })
    return () => animation.stop()
  }, [duration, opacity, visible])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && onRequestClose) return onRequestClose()
      return false
    })
    return () => subscription.remove()
  }, [onRequestClose, visible])

  if (!rendered) return null
  return (
    <Animated.View
      testID={testID}
      style={[
        styles.overlay,
        {
          opacity,
          backgroundColor: backgroundColor ?? token.backgroundColor,
          zIndex: zIndex ?? token.zIndex,
        },
        overlayStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close overlay"
        onPress={onPress}
        style={[styles.touchable, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}
