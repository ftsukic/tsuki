import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import type { View, StyleProp, ViewStyle } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { useAnimatedTransition } from '../motion'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { OverlayProps } from './interface'
import { getOverlayToken } from './token'
import { OverlaySurface } from './surface'

export interface OverlayAnimatedSurfaceProps extends OverlayProps {
  pressableStyle?: StyleProp<ViewStyle>
}

/** Owns the default fade and mount/unmount lifecycle for an overlay surface. */
export const OverlayAnimatedSurface = forwardRef<View, OverlayAnimatedSurfaceProps>(
  function OverlayAnimatedSurface(props, ref) {
    const { token: themeToken } = useToken()
    const token = useComponentToken('Overlay', getOverlayToken)
    const { show = false, duration = token.animationDuration, onClosed, ...surfaceProps } = props
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

    const semantic = resolveStyles(surfaceProps.styles, {
      props: { ...surfaceProps, show },
      state: { show, rendered },
    })
    const resolvedStyle = StyleSheet.flatten([semantic?.root, surfaceProps.style]) ?? {}
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

    return (
      <OverlaySurface
        {...surfaceProps}
        ref={ref}
        show={show}
        rendered={rendered}
        animatedStyle={animatedStyle}
      />
    )
  },
)

OverlayAnimatedSurface.displayName = 'Overlay.AnimatedSurface'
