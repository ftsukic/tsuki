import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BackHandler, Platform, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { Animated, motionPresets, useAnimatedStyle, useTransitionProgress } from '../motion'
import { OverlaySurface } from '../overlay/surface'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { PopupProps } from './interface'
import { getPopupStyles } from './style'
import { getPopupToken } from './token'

export const PopupContent = forwardRef<View, PopupProps>(function PopupContent(props, ref) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Popup', getPopupToken)
  const safeAreaInsets = useContext(SafeAreaInsetsContext)
  const {
    visible = false,
    position = 'center',
    overlay = true,
    closeOnPressOverlay = false,
    safeAreaInsetBottom = false,
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
  const previousVisible = useRef<boolean | null>(null)
  const currentPositionRef = useRef(position)
  const renderedPositionRef = useRef(position)
  const [settledPosition, setSettledPosition] = useState(position)
  const renderedRef = useRef(visible || !lazyRender)
  const [rendered, setRendered] = useState(renderedRef.current)
  const visibleRef = useRef(visible)
  const onPressOverlayRef = useRef(onPressOverlay)
  const onRequestCloseRef = useRef(onRequestClose)
  const onOpenRef = useRef(onOpen)
  const onOpenedRef = useRef(onOpened)
  const onCloseRef = useRef(onClose)
  const onClosedRef = useRef(onClosed)
  const destroyOnClosedRef = useRef(destroyOnClosed)
  const closingRef = useRef(false)
  const openedNotifiedRef = useRef(false)
  const closedNotifiedRef = useRef(!visible)

  currentPositionRef.current = position
  if (visible) renderedPositionRef.current = position

  visibleRef.current = visible
  onPressOverlayRef.current = onPressOverlay
  onRequestCloseRef.current = onRequestClose
  onOpenRef.current = onOpen
  onOpenedRef.current = onOpened
  onCloseRef.current = onClose
  onClosedRef.current = onClosed
  destroyOnClosedRef.current = destroyOnClosed

  // The overlay child can run its closing effect before this component's effect.
  // Mark the panel as closing during render so the child cannot finish the
  // whole popup before onClose has been dispatched.
  if (!visible && previousVisible.current === true) {
    closingRef.current = true
    closedNotifiedRef.current = false
  }

  const finishClose = useMemo(
    () => () => {
      if (
        visibleRef.current ||
        !renderedRef.current ||
        !closingRef.current ||
        closedNotifiedRef.current
      ) {
        return
      }

      closedNotifiedRef.current = true
      closingRef.current = false
      const nextPosition = currentPositionRef.current
      renderedPositionRef.current = nextPosition
      setSettledPosition(nextPosition)
      if (destroyOnClosedRef.current) {
        renderedRef.current = false
        setRendered(false)
      }
      onClosedRef.current?.()
    },
    [],
  )

  useEffect(() => {
    if (!lazyRender && !renderedRef.current) {
      renderedRef.current = true
      setRendered(true)
    }
  }, [lazyRender])

  const isExiting = !visible && (previousVisible.current === true || closingRef.current)
  const effectivePosition = visible
    ? position
    : isExiting
      ? renderedPositionRef.current
      : settledPosition
  const bottomInset =
    effectivePosition === 'bottom' && safeAreaInsetBottom ? (safeAreaInsets?.bottom ?? 0) : 0

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

    if (visible) {
      closingRef.current = false
      renderedRef.current = true
      setRendered(true)
      openedNotifiedRef.current = false
      closedNotifiedRef.current = false
      onOpenRef.current?.()
      return
    }

    if (wasVisible !== true || !renderedRef.current) return

    closedNotifiedRef.current = false
    onCloseRef.current?.()
  }, [visible])

  const handleTransitionEnd = useMemo(
    () => (transitionVisible: boolean) => {
      if (transitionVisible) {
        if (!visibleRef.current || openedNotifiedRef.current) return
        openedNotifiedRef.current = true
        onOpenedRef.current?.()
        return
      }

      if (visibleRef.current || !renderedRef.current) return
      finishClose()
    },
    [finishClose],
  )

  const resolvedStyles = useMemo(
    () => getPopupStyles(token, effectivePosition, round),
    [effectivePosition, round, token],
  )
  const semantic = resolveStyles(styles, {
    props,
    state: { visible, position: effectivePosition, rendered },
  })
  const panelResolvedStyle = StyleSheet.flatten([semantic?.panel, style])
  const panelOpacity =
    typeof panelResolvedStyle?.opacity === 'number' ? panelResolvedStyle.opacity : 1
  const overlayResolvedStyle = StyleSheet.flatten([semantic?.overlay, overlayStyle])
  const overlayOpacity =
    typeof overlayResolvedStyle?.opacity === 'number' ? overlayResolvedStyle.opacity : 1
  const motionPreset = useMemo(() => {
    switch (effectivePosition) {
      case 'top':
        return motionPresets.popupTop
      case 'bottom':
        return motionPresets.popupBottom
      case 'left':
        return motionPresets.drawerLeft
      case 'right':
        return motionPresets.drawerRight
      case 'center':
      default:
        return motionPresets.dialog
    }
  }, [effectivePosition])
  const transitionDistance =
    effectivePosition === 'top' || effectivePosition === 'bottom'
      ? Math.max(height, 1)
      : Math.max(width, 1)
  const enteringConfig = useMemo(
    () =>
      themeToken.motion && motionPreset.entering
        ? motionPreset.entering
        : {
            duration: animationDuration,
            easing: Easing.out(Easing.ease),
            mode: 'timing' as const,
          },
    [animationDuration, motionPreset, themeToken.motion],
  )
  const leavingConfig = useMemo(
    () => ({
      duration: animationDuration,
      easing: Easing.in(Easing.ease),
      mode: 'timing' as const,
    }),
    [animationDuration],
  )
  const { progress, animatedStyle: animatedPanelStyle } = useTransitionProgress({
    visible,
    preset: motionPreset,
    distance: transitionDistance,
    // Keep the opacity key present when switching from the center scale
    // transition to a positional slide before the first frame is committed.
    opacity: panelOpacity,
    entering: enteringConfig,
    leaving: leavingConfig,
    onTransitionEnd: handleTransitionEnd,
  })
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value * overlayOpacity,
  }))

  const handleOverlayPress = (event: Parameters<NonNullable<PopupProps['onPressOverlay']>>[0]) => {
    onPressOverlayRef.current?.(event)
    if (closeOnPressOverlay) onRequestCloseRef.current?.()
  }

  if (!rendered) return null

  return (
    <View
      collapsable={false}
      pointerEvents={visible ? (overlay ? 'auto' : 'box-none') : 'none'}
      style={[resolvedStyles.root, { zIndex }, semantic?.root]}
    >
      {overlay ? (
        <OverlaySurface
          show={visible}
          rendered={rendered}
          backgroundColor={token.overlayColor}
          zIndex={zIndex}
          onPress={handleOverlayPress}
          animatedStyle={animatedOverlayStyle}
          style={[resolvedStyles.overlay, semantic?.overlay, overlayStyle]}
          pressableStyle={[semantic?.overlay, overlayStyle]}
        />
      ) : null}
      <View pointerEvents="box-none" style={[resolvedStyles.container, { zIndex: zIndex + 1 }]}>
        <Animated.View
          ref={ref}
          {...viewProps}
          pointerEvents={visible ? 'auto' : 'none'}
          style={[
            resolvedStyles.panel,
            { zIndex: zIndex + 1 },
            semantic?.panel,
            style,
            bottomInset > 0 ? { paddingBottom: bottomInset } : null,
            animatedPanelStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </View>
  )
})

PopupContent.displayName = 'Popup.Content'

export const Popup = forwardRef<View, PopupProps>(function Popup(props, ref) {
  return (
    <Portal>
      <PopupContent {...props} ref={ref} />
    </Portal>
  )
})

Popup.displayName = 'Popup'
