import { OverlaySurface } from '../overlay'
import { Portal } from '../portal'
import { useToken } from '../theme'
import type { PopupProps } from './interface'
import { createPopupStyles, getPositionStyle } from './style'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, BackHandler, Easing, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function Popup({
  children,
  visible,
  duration = 350,
  overlay = true,
  closeOnPressOverlay = true,
  onPressOverlay,
  onOpen,
  onOpened,
  onClose,
  onClosed,
  onRequestClose,
  overlayBackgroundColor,
  position = 'center',
  round = false,
  safeAreaInsetBottom = false,
  safeAreaInsetTop = false,
  lazyRender = true,
  destroyOnClosed = false,
  style,
  theme,
  testID,
}: PopupProps) {
  const { components } = useToken()
  const token = { ...components.Popup, ...theme }
  const styles = useMemo(() => createPopupStyles(token), [token])
  const insets = useSafeAreaInsets()
  const { height, width } = useWindowDimensions()
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current
  const [rendered, setRendered] = useState(visible || !lazyRender)
  const [overlayRendered, setOverlayRendered] = useState(visible)
  const mounted = useRef(false)
  const panelClosed = useRef(!visible)
  const overlayClosed = useRef(!visible || !overlay)
  const closedNotified = useRef(!visible)
  const onOpenRef = useRef(onOpen)
  const onOpenedRef = useRef(onOpened)
  const onCloseRef = useRef(onClose)
  const onClosedRef = useRef(onClosed)
  const shouldUnmount = destroyOnClosed || lazyRender
  const positionStyle = styles[getPositionStyle(position)]
  const distance = position === 'top' || position === 'bottom' ? height : width
  const translate = progress.interpolate({
    inputRange: [0, 1],
    outputRange:
      position === 'top'
        ? [-distance, 0]
        : position === 'bottom'
          ? [distance, 0]
          : position === 'left'
            ? [-distance, 0]
            : [distance, 0],
  })

  const finishClose = useCallback(() => {
    if (!panelClosed.current || !overlayClosed.current || closedNotified.current) return
    closedNotified.current = true
    onClosedRef.current?.()
    if (shouldUnmount) setRendered(false)
  }, [shouldUnmount])

  useEffect(() => {
    onOpenRef.current = onOpen
    onOpenedRef.current = onOpened
    onCloseRef.current = onClose
    onClosedRef.current = onClosed
  }, [onClose, onClosed, onOpen, onOpened])

  useEffect(() => {
    if (visible) {
      setRendered(true)
      closedNotified.current = false
      panelClosed.current = false
      if (overlay) {
        setOverlayRendered(true)
        overlayClosed.current = false
      } else overlayClosed.current = true
    } else if (!overlay) {
      overlayClosed.current = true
    }
    if (!mounted.current) {
      mounted.current = true
      return
    }

    if (visible) onOpenRef.current?.()
    else onCloseRef.current?.()

    const animation = Animated.timing(progress, {
      duration,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    })

    animation.start(({ finished }) => {
      if (!finished) return
      if (visible) {
        onOpenedRef.current?.()
      } else {
        panelClosed.current = true
        finishClose()
      }
    })

    return () => animation.stop()
  }, [
    destroyOnClosed,
    duration,
    height,
    lazyRender,
    overlay,
    progress,
    finishClose,
    shouldUnmount,
    visible,
    width,
  ])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!visible) return false
      if (onRequestClose?.()) return true
      onPressOverlay?.()
      return true
    })
    return () => subscription.remove()
  }, [onPressOverlay, onRequestClose, visible])

  if (!rendered) return null

  const closeFromOverlay = () => {
    if (closeOnPressOverlay) onPressOverlay?.()
  }
  const panelStyle = [
    styles.panel,
    positionStyle,
    position === 'center'
      ? { opacity: progress }
      : {
          transform: [
            position === 'top' || position === 'bottom'
              ? { translateY: translate }
              : { translateX: translate },
          ],
        },
    { zIndex: token.zIndex + 1 },
    round && {
      borderRadius: token.borderRadius,
    },
    safeAreaInsetBottom && { paddingBottom: insets.bottom },
    safeAreaInsetTop && { paddingTop: insets.top },
    style,
  ]

  return (
    <Portal>
      <View testID={testID} style={styles.root}>
        {overlay && overlayRendered ? (
          <OverlaySurface
            visible={visible}
            duration={duration}
            backgroundColor={overlayBackgroundColor ?? token.overlayColor}
            zIndex={token.zIndex}
            onPress={closeFromOverlay}
            onClosed={() => {
              overlayClosed.current = true
              setOverlayRendered(false)
              finishClose()
            }}
          />
        ) : null}
        <Animated.View style={panelStyle}>{children}</Animated.View>
      </View>
    </Portal>
  )
}
