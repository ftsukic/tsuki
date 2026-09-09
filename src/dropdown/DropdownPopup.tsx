import { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { Animated, useAnimatedStyle, useTransitionProgress } from '../motion'
import { OverlaySurface } from '../overlay/surface'
import { Portal } from '../portal'
import { useComponentToken, useToken } from '../theme'
import { getDropdownToken } from './token'
import type { DropdownDirection } from './types'
import type { DropdownItemRegistration } from './context'

interface DropdownPopupProps {
  visible: boolean
  direction: DropdownDirection
  overlay: boolean
  closeOnPressOverlay: boolean
  duration?: number
  zIndex?: number
  menuTop: number
  menuBottom: number
  windowHeight: number
  item?: DropdownItemRegistration
  panelStyle?: StyleProp<ViewStyle>
  overlayStyle?: StyleProp<ViewStyle>
  panelContent?: React.ReactNode
  panelContentKey?: string | number
  onRequestClose: () => void
  onOpened: () => void
  onClosed: () => void
}

export function DropdownPopup({
  visible,
  direction,
  overlay,
  closeOnPressOverlay,
  duration,
  zIndex,
  menuTop,
  menuBottom,
  windowHeight,
  item,
  panelStyle,
  overlayStyle,
  panelContent,
  panelContentKey,
  onRequestClose,
  onOpened,
  onClosed,
}: DropdownPopupProps) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Dropdown', getDropdownToken)
  const normalizedDuration = Number.isFinite(duration)
    ? Math.max(0, duration as number)
    : token.animationDuration
  const animationDuration = themeToken.motion ? normalizedDuration : 0
  const itemRef = useRef(item)
  if (item) itemRef.current = item
  const effectiveItem = itemRef.current
  const effectivePanelContent = panelContent === undefined ? effectiveItem?.content : panelContent
  const effectivePanelStyle = panelStyle === undefined ? effectiveItem?.contentStyle : panelStyle
  const effectiveOverlayStyle =
    overlayStyle === undefined ? effectiveItem?.overlayStyle : overlayStyle
  const estimatedHeight = effectiveItem?.estimatedHeight
  const [panelHeight, setPanelHeight] = useState(estimatedHeight ?? 0)
  const [panelMeasured, setPanelMeasured] = useState(estimatedHeight !== undefined)
  const [rendered, setRendered] = useState(visible)
  const visibleRef = useRef(visible)
  const previousVisibleRef = useRef(visible)
  const openedRef = useRef(false)
  const closedRef = useRef(!visible)
  const previousContentKeyRef = useRef(panelContentKey)

  visibleRef.current = visible

  useEffect(() => {
    const contentChanged = previousContentKeyRef.current !== panelContentKey
    previousContentKeyRef.current = panelContentKey
    if (!contentChanged) return

    setPanelHeight(estimatedHeight ?? 0)
    setPanelMeasured(estimatedHeight !== undefined)
  }, [estimatedHeight, panelContentKey])

  useEffect(() => {
    const wasVisible = previousVisibleRef.current
    previousVisibleRef.current = visible

    if (visible) {
      setRendered(true)
      if (!wasVisible) {
        openedRef.current = false
        closedRef.current = false
      }
      return
    }

    if (wasVisible) {
      closedRef.current = false
    }
  }, [visible])

  const waitingForFirstMeasurement =
    visible &&
    previousVisibleRef.current !== true &&
    !panelMeasured &&
    estimatedHeight === undefined
  const transitionVisible = visible && !waitingForFirstMeasurement
  const handleTransitionEnd = (transitionVisibleValue: boolean) => {
    if (transitionVisibleValue) {
      if (!visibleRef.current || openedRef.current) return
      openedRef.current = true
      onOpened()
      return
    }

    if (visibleRef.current || !rendered || closedRef.current) return
    closedRef.current = true
    setRendered(false)
    onClosed()
  }

  const entering = useMemo(
    () => ({
      duration: animationDuration,
      easing: Easing.out(Easing.ease),
      mode: 'timing' as const,
    }),
    [animationDuration],
  )
  const leaving = useMemo(
    () => ({
      duration: animationDuration,
      easing: Easing.in(Easing.ease),
      mode: 'timing' as const,
    }),
    [animationDuration],
  )

  const { progress, animatedStyle: animatedPanelStyle } = useTransitionProgress({
    visible: transitionVisible,
    type: direction === 'down' ? 'slide-down' : 'slide-up',
    distance: Math.max(panelHeight, 1),
    opacity: 1,
    entering,
    leaving,
    onTransitionEnd: handleTransitionEnd,
  })

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }))

  const rootStyle =
    direction === 'down'
      ? {
          bottom: 0,
          left: 0,
          right: 0,
          top: Math.max(0, menuBottom),
        }
      : {
          bottom: Math.max(0, windowHeight - menuTop),
          left: 0,
          right: 0,
          top: 0,
        }

  const portalContent =
    !rendered && !visible ? null : (
      <View
        collapsable={false}
        pointerEvents={visible ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, rootStyle, { zIndex }]}
      >
        {overlay ? (
          <OverlaySurface
            testID="dropdown-overlay"
            show={visible}
            rendered={rendered}
            backgroundColor={token.overlayColor}
            zIndex={zIndex}
            onPress={closeOnPressOverlay ? onRequestClose : undefined}
            animatedStyle={animatedOverlayStyle}
            style={effectiveOverlayStyle}
            pressableStyle={effectiveOverlayStyle}
          />
        ) : null}
        <View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: direction === 'up' ? 'flex-end' : 'flex-start',
              zIndex: (zIndex ?? token.zIndex) + 1,
            },
          ]}
        >
          <Animated.View
            key={panelContentKey}
            testID="dropdown-panel"
            onLayout={(event) => {
              const nextHeight = event.nativeEvent.layout.height
              if (nextHeight <= 0) return
              setPanelHeight(nextHeight)
              setPanelMeasured(true)
            }}
            pointerEvents={visible ? 'auto' : 'none'}
            style={[
              {
                backgroundColor: token.contentBackgroundColor,
                width: '100%',
                zIndex: (zIndex ?? token.zIndex) + 1,
              },
              effectivePanelStyle,
              panelHeight <= 0 ? { opacity: 0 } : null,
              animatedPanelStyle,
            ]}
          >
            {effectivePanelContent}
          </Animated.View>
        </View>
      </View>
    )
  return <Portal>{portalContent}</Portal>
}

DropdownPopup.displayName = 'DropdownPopup'
