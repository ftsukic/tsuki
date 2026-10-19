import { OVERLAY_PRESETS, overlayAnimation } from '../motion/presets'
import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BackHandler, Platform, StyleSheet, View, useWindowDimensions } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useTransitionProgressState } from '../motion/useTransitionProgress'
import { useMotionConfig } from '../motion/useMotionConfig'
import { OverlaySurface } from '../overlay/overlay-surface'
import { TeleportPortal as Portal } from '../portal/teleport-portal'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { PopupProps } from './types'
import { getPopupBottomPadding, getPopupStyles } from './style'
import { getPopupToken } from './token'
import { usePopupKeyboard } from './usePopupKeyboard'

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
    keyboardAvoiding = false,
    onPressOverlay,
    onRequestClose,
    duration = token.animationDuration,
    round = false,
    lazyRender = true,
    destroyOnClosed = false,
    zIndex = token.zIndex,
    style,
    styles,
    onOpen,
    onOpened,
    onClose,
    onClosed,
    children,
    onLayout,
    ...viewProps
  } = props
  const { width } = useWindowDimensions()
  const [wrapperWidth, setWrapperWidth] = useState<number>()
  const [panelSize, setPanelSize] = useState<{
    width: number
    height: number
    position: PopupProps['position']
  }>()
  const latestPanelSize = useRef<typeof panelSize>(undefined)
  const motionPolicy = useMotionConfig()
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
        setPanelSize(undefined)
        latestPanelSize.current = undefined
      } else {
        setPanelSize(latestPanelSize.current)
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
  const keyboard = usePopupKeyboard(
    keyboardAvoiding && rendered,
    panelSize?.height ?? 0,
    effectivePosition,
  )
  const bottomInset =
    effectivePosition === 'bottom' && safeAreaInsetBottom && keyboard.overlap === 0
      ? (safeAreaInsets?.bottom ?? 0)
      : 0

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
        setPanelSize(latestPanelSize.current)
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
  const panelResolvedStyle = StyleSheet.flatten(semantic?.container)
  const safeAreaStyle =
    bottomInset > 0
      ? {
          paddingBottom: getPopupBottomPadding(
            panelResolvedStyle,
            wrapperWidth ?? width,
            bottomInset,
          ),
        }
      : null
  const panelOpacity =
    typeof panelResolvedStyle?.opacity === 'number' ? panelResolvedStyle.opacity : 1
  const overlayResolvedStyle = StyleSheet.flatten(semantic?.mask)
  const overlayMaskStyle = { ...overlayResolvedStyle }
  delete overlayMaskStyle.opacity
  const overlayOpacity =
    typeof overlayResolvedStyle?.opacity === 'number' ? overlayResolvedStyle.opacity : 1
  const motionPreset = useMemo(() => {
    switch (effectivePosition) {
      case 'top':
        return OVERLAY_PRESETS.popupTop
      case 'bottom':
        return OVERLAY_PRESETS.popupBottom
      case 'left':
        return OVERLAY_PRESETS.drawerLeft
      case 'right':
        return OVERLAY_PRESETS.drawerRight
      case 'center':
      default:
        return OVERLAY_PRESETS.dialog
    }
  }, [effectivePosition])
  const isSlide = effectivePosition !== 'center'
  const measured = panelSize?.position === effectivePosition
  const transitionDistance = measured
    ? effectivePosition === 'top' || effectivePosition === 'bottom'
      ? panelSize.height
      : panelSize.width
    : 0
  const ready = !isSlide || measured || !motionPolicy.enabled || animationDuration === 0
  const enteringConfig = useMemo(
    () => overlayAnimation(animationDuration, true),
    [animationDuration],
  )
  const leavingConfig = useMemo(
    () => overlayAnimation(animationDuration, false),
    [animationDuration],
  )
  const { progress, animatedStyle: animatedPanelStyle } = useTransitionProgressState(
    {
      visible,
      preset: motionPreset,
      distance: transitionDistance,
      // Keep the opacity key present when switching from the center scale
      // transition to a positional slide before the first frame is committed.
      // Animated styles override ordinary styles on Web, including the first
      // cached style applied when a lazily rendered panel mounts.
      opacity: ready ? panelOpacity : 0,
      entering: enteringConfig,
      leaving: leavingConfig,
      onTransitionEnd: handleTransitionEnd,
    },
    ready || !visible,
  )
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: ready ? progress.value * overlayOpacity : 0,
  }))

  const handleOverlayPress = (event: Parameters<NonNullable<PopupProps['onPressOverlay']>>[0]) => {
    onPressOverlayRef.current?.(event)
    if (closeOnPressOverlay) onRequestCloseRef.current?.()
  }

  if (!rendered) return null

  const positionedPanel = (
    <View
      pointerEvents="box-none"
      onLayout={(event) => setWrapperWidth(event.nativeEvent.layout.width)}
      style={[resolvedStyles.container, { zIndex: zIndex + 1 }, semantic?.wrapper]}
    >
      <Animated.View
        ref={ref}
        {...viewProps}
        onLayout={(event) => {
          const { width: panelWidth, height: panelHeight } = event.nativeEvent.layout
          if (panelWidth > 0 && panelHeight > 0) {
            latestPanelSize.current = {
              width: panelWidth,
              height: panelHeight,
              position: effectivePosition,
            }
            // Freeze only in transit; stable content may resize before the next exit.
            setPanelSize((previous) =>
              previous?.position === effectivePosition &&
              ((!openedNotifiedRef.current && visible) || isExiting)
                ? previous
                : previous?.position === effectivePosition &&
                    previous.width === panelWidth &&
                    previous.height === panelHeight
                  ? previous
                  : { width: panelWidth, height: panelHeight, position: effectivePosition },
            )
          }
          onLayout?.(event)
        }}
        pointerEvents={visible && ready ? 'auto' : 'none'}
        style={[
          resolvedStyles.panel,
          { zIndex: zIndex + 1 },
          semantic?.container,
          keyboardAvoiding
            ? {
                maxHeight: keyboard.measured ? keyboard.availableHeight : '100%',
                flexShrink: 1,
              }
            : null,
          safeAreaStyle,
          animatedPanelStyle,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  )

  return (
    <View
      ref={keyboard.hostRef}
      onLayout={keyboardAvoiding ? keyboard.onLayout : undefined}
      collapsable={false}
      accessibilityElementsHidden={!visible || !ready}
      importantForAccessibility={visible && ready ? 'auto' : 'no-hide-descendants'}
      pointerEvents={visible && ready ? (overlay ? 'auto' : 'box-none') : 'none'}
      style={[resolvedStyles.root, { zIndex }, semantic?.root, style]}
    >
      {overlay ? (
        <OverlaySurface
          show={visible}
          rendered={rendered}
          backgroundColor={token.overlayColor}
          zIndex={zIndex}
          onPress={handleOverlayPress}
          animatedStyle={animatedOverlayStyle}
          styles={{
            mask: [resolvedStyles.overlay, overlayMaskStyle],
          }}
        />
      ) : null}
      {keyboardAvoiding ? (
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, { zIndex: zIndex + 1 }, keyboard.animatedStyle]}
        >
          {positionedPanel}
        </Animated.View>
      ) : (
        positionedPanel
      )}
    </View>
  )
})

PopupContent.displayName = 'Popup.Content'

export const Popup = forwardRef<View, PopupProps>(function Popup(props, ref) {
  return (
    <Portal hostName="root">
      <PopupContent {...props} ref={ref} />
    </Portal>
  )
})

Popup.displayName = 'Popup'
