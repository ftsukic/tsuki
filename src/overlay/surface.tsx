import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import type { ForwardedRef } from 'react'
import type { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { AnimatedStyle } from 'react-native-reanimated'
import { Easing } from 'react-native-reanimated'
import { Animated, useAnimatedTransition } from '../motion'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { OverlayProps } from './interface'
import { getOverlayToken } from './token'

export interface OverlaySurfaceProps extends OverlayProps {
  onClosed?: () => void
  pressableStyle?: StyleProp<ViewStyle>

  /** Internal mode used when Popup owns the transition and rendered lifecycle. */
  animatedStyle?: AnimatedStyle<ViewStyle>
  externallyAnimated?: boolean
  forceRendered?: boolean
}

function resolveSurfacePresentation(props: OverlaySurfaceProps, rendered: boolean) {
  const { show = false, style, styles } = props
  const semantic = resolveStyles(styles, {
    props,
    state: { show, rendered },
  })
  const resolvedStyle = StyleSheet.flatten([semantic?.root, style]) ?? {}

  return { resolvedStyle, semantic }
}

function renderSurface(
  props: OverlaySurfaceProps,
  ref: ForwardedRef<View>,
  token: ReturnType<typeof getOverlayToken>,
  rendered: boolean,
  animatedStyle?: AnimatedStyle<ViewStyle>,
) {
  const {
    show = false,
    backgroundColor = token.backgroundColor,
    zIndex = token.zIndex,
    children,
    onPress,
    pressableStyle,
  } = props
  const viewProps = { ...props }
  delete viewProps.show
  delete viewProps.backgroundColor
  delete viewProps.zIndex
  delete viewProps.children
  delete viewProps.onPress
  delete viewProps.style
  delete viewProps.styles
  delete viewProps.pressableStyle
  delete viewProps.onClosed
  delete viewProps.animatedStyle
  delete viewProps.externallyAnimated
  delete viewProps.forceRendered
  delete viewProps.duration
  const { resolvedStyle, semantic } = resolveSurfacePresentation(props, rendered)
  const staticStyle = { ...resolvedStyle }
  delete staticStyle.opacity

  if (!rendered) return null

  return (
    <Animated.View
      ref={ref}
      {...viewProps}
      collapsable={false}
      pointerEvents={show ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { backgroundColor, zIndex }, staticStyle, animatedStyle]}
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
}

const StandaloneOverlaySurface = forwardRef<View, OverlaySurfaceProps>(
  function StandaloneOverlaySurface(props, ref) {
    const { token: themeToken } = useToken()
    const token = useComponentToken('Overlay', getOverlayToken)
    const { show = false, duration = token.animationDuration, onClosed } = props
    const normalizedDuration = Number.isFinite(duration)
      ? Math.max(0, duration as number)
      : Math.max(0, token.animationDuration)
    const animationDuration = themeToken.motion ? normalizedDuration : 0
    const showRef = useRef(show)
    const renderedRef = useRef(show)
    const onClosedRef = useRef(onClosed)
    const [rendered, setRendered] = useState(show)

    showRef.current = show
    onClosedRef.current = onClosed

    useEffect(() => {
      if (!show) return

      renderedRef.current = true
      setRendered(true)
    }, [show])

    const { resolvedStyle } = resolveSurfacePresentation(props, rendered)
    const targetOpacity = typeof resolvedStyle.opacity === 'number' ? resolvedStyle.opacity : 1

    const handleTransitionEnd = useCallback((transitionShow: boolean) => {
      if (transitionShow || showRef.current || !renderedRef.current) return

      renderedRef.current = false
      setRendered(false)
      onClosedRef.current?.()
    }, [])
    const enteringConfig = useMemo(
      () => ({
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
        mode: 'timing' as const,
      }),
      [animationDuration],
    )
    const leavingConfig = useMemo(
      () => ({
        duration: animationDuration,
        easing: Easing.in(Easing.ease),
        mode: 'timing' as const,
      }),
      [animationDuration],
    )
    const animatedStyle = useAnimatedTransition({
      visible: show,
      type: 'fade',
      opacity: targetOpacity,
      entering: enteringConfig,
      leaving: leavingConfig,
      onTransitionEnd: handleTransitionEnd,
    })

    return renderSurface(props, ref, token, rendered, animatedStyle)
  },
)

const ControlledOverlaySurface = forwardRef<View, OverlaySurfaceProps>(
  function ControlledOverlaySurface(props, ref) {
    const token = useComponentToken('Overlay', getOverlayToken)
    const { show = false, forceRendered = show, animatedStyle } = props

    return renderSurface(props, ref, token, forceRendered, animatedStyle)
  },
)

/** Renders an overlay without creating another Portal entry. */
export const OverlaySurface = forwardRef<View, OverlaySurfaceProps>(
  function OverlaySurface(props, ref) {
    if (props.externallyAnimated) {
      return <ControlledOverlaySurface {...props} ref={ref} />
    }

    return <StandaloneOverlaySurface {...props} ref={ref} />
  },
)

OverlaySurface.displayName = 'Overlay.Surface'
