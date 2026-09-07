import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  BackHandler,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { OverlaySurface } from '../overlay/surface'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { PopupProps } from './interface'
import { getPopupStyles } from './style'
import { getPopupToken } from './token'

export const Popup = forwardRef<View, PopupProps>(function Popup(props, ref) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Popup', getPopupToken)
  const {
    visible = false,
    position = 'center',
    overlay = true,
    closeOnPressOverlay = false,
    onPressOverlay,
    onRequestClose,
    duration = token.animationDuration,
    round = false,
    lazyRender = true,
    destroyOnClosed = false,
    zIndex = token.zIndex,
    overlayStyle,
    style,
    styles,
    onOpen,
    onOpened,
    onClose,
    onClosed,
    children,
    ...viewProps
  } = props
  const { width, height } = useWindowDimensions()
  const normalizedDuration = Number.isFinite(duration)
    ? Math.max(0, duration)
    : token.animationDuration
  const animationDuration = themeToken.motion ? normalizedDuration : 0
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current
  const animation = useRef<Animated.CompositeAnimation | null>(null)
  const previousVisible = useRef<boolean | null>(null)
  const renderedRef = useRef(visible || !lazyRender)
  const [rendered, setRendered] = useState(renderedRef.current)
  const visibleRef = useRef(visible)
  const overlayRef = useRef(overlay)
  const onPressOverlayRef = useRef(onPressOverlay)
  const onRequestCloseRef = useRef(onRequestClose)
  const onOpenRef = useRef(onOpen)
  const onOpenedRef = useRef(onOpened)
  const onCloseRef = useRef(onClose)
  const onClosedRef = useRef(onClosed)
  const animationDurationRef = useRef(animationDuration)
  const destroyOnClosedRef = useRef(destroyOnClosed)
  const panelClosedRef = useRef(!visible)
  const overlayClosedRef = useRef(!visible || !overlay)
  const closedNotifiedRef = useRef(!visible)

  visibleRef.current = visible
  overlayRef.current = overlay
  onPressOverlayRef.current = onPressOverlay
  onRequestCloseRef.current = onRequestClose
  onOpenRef.current = onOpen
  onOpenedRef.current = onOpened
  onCloseRef.current = onClose
  onClosedRef.current = onClosed
  animationDurationRef.current = animationDuration
  destroyOnClosedRef.current = destroyOnClosed

  const finishClose = () => {
    if (!panelClosedRef.current || !overlayClosedRef.current || closedNotifiedRef.current) return

    closedNotifiedRef.current = true
    if (destroyOnClosedRef.current) {
      renderedRef.current = false
      setRendered(false)
    }
    onClosedRef.current?.()
  }

  useEffect(() => {
    if (!lazyRender && !renderedRef.current) {
      renderedRef.current = true
      setRendered(true)
    }
  }, [lazyRender])

  useEffect(() => {
    if (Platform.OS !== 'android' || !visible || !rendered) return

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!visibleRef.current || !onRequestCloseRef.current) return false

      onRequestCloseRef.current()
      return true
    })

    return () => subscription.remove()
  }, [rendered, visible])

  useEffect(() => {
    const wasVisible = previousVisible.current
    previousVisible.current = visible

    if (wasVisible === visible) return

    animation.current?.stop()
    animation.current = null

    if (visible) {
      renderedRef.current = true
      setRendered(true)
      panelClosedRef.current = false
      overlayClosedRef.current = !overlayRef.current
      closedNotifiedRef.current = false
      if (wasVisible === null) progress.setValue(0)
      onOpenRef.current?.()

      if (animationDurationRef.current === 0) {
        progress.setValue(1)
        panelClosedRef.current = true
        onOpenedRef.current?.()
        return
      }

      const nextAnimation = Animated.timing(progress, {
        toValue: 1,
        duration: animationDurationRef.current,
        easing: Easing.out(Easing.cubic),
        isInteraction: false,
        useNativeDriver: Platform.OS !== 'web',
      })
      animation.current = nextAnimation
      nextAnimation.start(({ finished }) => {
        if (animation.current === nextAnimation) animation.current = null
        if (finished) {
          panelClosedRef.current = true
          onOpenedRef.current?.()
        }
      })

      return () => nextAnimation.stop()
    }

    if (wasVisible !== true || !renderedRef.current) return

    panelClosedRef.current = false
    overlayClosedRef.current = !overlayRef.current
    closedNotifiedRef.current = false
    onCloseRef.current?.()

    if (animationDurationRef.current === 0) {
      progress.setValue(0)
      panelClosedRef.current = true
      finishClose()
      return
    }

    const nextAnimation = Animated.timing(progress, {
      toValue: 0,
      duration: animationDurationRef.current,
      easing: Easing.in(Easing.cubic),
      isInteraction: false,
      useNativeDriver: Platform.OS !== 'web',
    })
    animation.current = nextAnimation
    nextAnimation.start(({ finished }) => {
      if (animation.current === nextAnimation) animation.current = null
      if (!finished) return

      panelClosedRef.current = true
      finishClose()
    })

    return () => nextAnimation.stop()
  }, [animationDuration, overlay, progress, visible])

  useEffect(
    () => () => {
      animation.current?.stop()
    },
    [],
  )

  const resolvedStyles = useMemo(
    () => getPopupStyles(token, position, round),
    [position, round, token],
  )
  const semantic = resolveStyles(styles, {
    props,
    state: { visible, position, rendered },
  })
  const overlayResolvedStyle = StyleSheet.flatten([semantic?.overlay, overlayStyle])
  const overlayOpacity =
    typeof overlayResolvedStyle?.opacity === 'number' ? overlayResolvedStyle.opacity : 1
  const animatedPanelStyle = useMemo(() => {
    const viewportWidth = Math.max(width, 1)
    const viewportHeight = Math.max(height, 1)

    switch (position) {
      case 'top':
        return {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-viewportHeight, 0],
              }),
            },
          ],
        }
      case 'bottom':
        return {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [viewportHeight, 0],
              }),
            },
          ],
        }
      case 'left':
        return {
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-viewportWidth, 0],
              }),
            },
          ],
        }
      case 'right':
        return {
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [viewportWidth, 0],
              }),
            },
          ],
        }
      case 'center':
      default:
        return {
          opacity: progress,
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.96, 1],
              }),
            },
          ],
        }
    }
  }, [height, position, progress, width])

  const handleOverlayPress = (event: Parameters<NonNullable<PopupProps['onPressOverlay']>>[0]) => {
    onPressOverlayRef.current?.(event)
    if (closeOnPressOverlay) onRequestCloseRef.current?.()
  }

  if (!rendered) return null

  return (
    <Portal>
      <View
        collapsable={false}
        pointerEvents={visible ? (overlay ? 'auto' : 'box-none') : 'none'}
        style={[resolvedStyles.root, { zIndex }, semantic?.root]}
      >
        {overlay ? (
          <OverlaySurface
            show={visible}
            duration={animationDuration}
            backgroundColor={token.overlayColor}
            zIndex={zIndex}
            onPress={handleOverlayPress}
            onClosed={() => {
              overlayClosedRef.current = true
              finishClose()
            }}
            style={[{ opacity: overlayOpacity }, semantic?.overlay, overlayStyle]}
            pressableStyle={[semantic?.overlay, overlayStyle]}
          />
        ) : null}
        <View pointerEvents="box-none" style={resolvedStyles.container}>
          <Animated.View
            ref={ref}
            {...viewProps}
            pointerEvents={visible ? 'auto' : 'none'}
            style={[
              resolvedStyles.panel,
              { zIndex: zIndex + 1 },
              semantic?.panel,
              style,
              animatedPanelStyle,
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </View>
    </Portal>
  )
})

Popup.displayName = 'Popup'
