import { forwardRef, useEffect, useRef, useState } from 'react'
import { Animated, Easing, Platform, Pressable, StyleSheet } from 'react-native'
import type { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { OverlayProps } from './interface'
import { getOverlayToken } from './token'

export interface OverlaySurfaceProps extends OverlayProps {
  onClosed?: () => void
  pressableStyle?: StyleProp<ViewStyle>
}

/** Renders an overlay without creating another Portal entry. */
export const OverlaySurface = forwardRef<View, OverlaySurfaceProps>(
  function OverlaySurface(props, ref) {
    const { token: themeToken } = useToken()
    const token = useComponentToken('Overlay', getOverlayToken)
    const {
      show = false,
      backgroundColor = token.backgroundColor,
      duration = token.animationDuration,
      zIndex = token.zIndex,
      children,
      onPress,
      style,
      styles,
      onClosed,
      pressableStyle,
      ...viewProps
    } = props
    const normalizedDuration = Number.isFinite(duration)
      ? Math.max(0, duration)
      : Math.max(0, token.animationDuration)
    const animationDuration = themeToken.motion ? normalizedDuration : 0
    const opacity = useRef(new Animated.Value(0)).current
    const animation = useRef<Animated.CompositeAnimation | null>(null)
    const previousShow = useRef<boolean | null>(null)
    const renderedRef = useRef(show)
    const onClosedRef = useRef(onClosed)
    const [rendered, setRendered] = useState(show)

    onClosedRef.current = onClosed

    useEffect(() => {
      const wasShown = previousShow.current
      previousShow.current = show

      if (wasShown === show) return

      animation.current?.stop()
      animation.current = null

      if (show) {
        renderedRef.current = true
        setRendered(true)
        if (wasShown === null) opacity.setValue(0)

        if (animationDuration === 0) {
          opacity.setValue(1)
          return
        }

        const nextAnimation = Animated.timing(opacity, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          isInteraction: false,
          useNativeDriver: Platform.OS !== 'web',
        })
        animation.current = nextAnimation
        nextAnimation.start(() => {
          if (animation.current === nextAnimation) animation.current = null
        })

        return () => nextAnimation.stop()
      }

      if (wasShown !== true || !renderedRef.current) return

      if (animationDuration === 0) {
        opacity.setValue(0)
        renderedRef.current = false
        setRendered(false)
        onClosedRef.current?.()
        return
      }

      const nextAnimation = Animated.timing(opacity, {
        toValue: 0,
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
        isInteraction: false,
        useNativeDriver: Platform.OS !== 'web',
      })
      animation.current = nextAnimation
      nextAnimation.start(({ finished }) => {
        if (animation.current === nextAnimation) animation.current = null
        if (!finished) return

        renderedRef.current = false
        setRendered(false)
        onClosedRef.current?.()
      })

      return () => nextAnimation.stop()
    }, [animationDuration, opacity, show])

    useEffect(
      () => () => {
        animation.current?.stop()
      },
      [],
    )

    const semantic = resolveStyles(styles, {
      props,
      state: { show, rendered },
    })
    const resolvedStyle = StyleSheet.flatten([semantic?.root, style]) ?? {}
    const targetOpacity = typeof resolvedStyle.opacity === 'number' ? resolvedStyle.opacity : 1
    const staticStyle = { ...resolvedStyle }
    delete staticStyle.opacity

    if (!rendered) return null

    return (
      <Animated.View
        ref={ref}
        {...viewProps}
        collapsable={false}
        pointerEvents={show ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor, zIndex },
          staticStyle,
          {
            opacity: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, targetOpacity],
            }),
          },
        ]}
      >
        <Pressable
          accessibilityElementsHidden={children == null ? true : undefined}
          accessible={children == null ? false : undefined}
          onPress={onPress}
          style={[StyleSheet.absoluteFill, pressableStyle, semantic?.content]}
        >
          {children}
        </Pressable>
      </Animated.View>
    )
  },
)

OverlaySurface.displayName = 'Overlay.Surface'
