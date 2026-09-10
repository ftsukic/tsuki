import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Animated } from '../motion'
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
  activeItem?: DropdownItemRegistration
  onRequestClose: () => void
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
  activeItem,
  onRequestClose,
}: DropdownPopupProps) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Dropdown', getDropdownToken)
  const normalizedDuration = Number.isFinite(duration)
    ? Math.max(0, duration as number)
    : token.animationDuration
  const animationDuration = themeToken.motion ? normalizedDuration : 0
  const [renderedItem, setRenderedItem] = useState<DropdownItemRegistration | undefined>(activeItem)
  const [measuredItemId, setMeasuredItemId] = useState<symbol | undefined>(undefined)
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined)
  const renderedItemRef = useRef(renderedItem)
  const activeItemRef = useRef(activeItem)
  const previousRenderedItemRef = useRef<DropdownItemRegistration | undefined>(undefined)
  const openedItemIdRef = useRef<symbol | undefined>(undefined)
  const openSettledRef = useRef(false)
  const initialMeasurementPendingRef = useRef(false)
  const visibleRef = useRef(visible)
  const transitionIdRef = useRef(0)
  const progress = useSharedValue(0)

  renderedItemRef.current = renderedItem
  activeItemRef.current = activeItem
  visibleRef.current = visible

  useLayoutEffect(() => {
    if (activeItem && renderedItemRef.current?.id !== activeItem.id) {
      initialMeasurementPendingRef.current = renderedItemRef.current === undefined
      setRenderedItem(activeItem)
    }
  }, [activeItem])

  useLayoutEffect(() => {
    if (!renderedItem) {
      setMeasuredItemId(undefined)
      setMeasuredHeight(undefined)
      return
    }

    setMeasuredItemId(undefined)
    setMeasuredHeight(undefined)
  }, [renderedItem, renderedItem?.estimatedHeight, renderedItem?.id])

  useEffect(() => {
    const previousItem = previousRenderedItemRef.current
    previousRenderedItemRef.current = renderedItem

    if (!renderedItem || !previousItem || previousItem.id === renderedItem.id) return

    if (openedItemIdRef.current === previousItem.id) {
      openedItemIdRef.current = undefined
    }
    previousItem.onClosed?.()

    if (
      visibleRef.current &&
      activeItemRef.current?.id === renderedItem.id &&
      openSettledRef.current
    ) {
      openedItemIdRef.current = renderedItem.id
      renderedItem.onOpened?.()
    }
  }, [renderedItem])

  const renderedItemId = renderedItem?.id
  const estimatedHeight = renderedItem?.estimatedHeight
  const isMeasured = renderedItemId !== undefined && measuredItemId === renderedItemId
  const panelHeight = isMeasured ? (measuredHeight ?? 0) : (estimatedHeight ?? 0)
  const firstRenderNeedsMeasurement =
    visible &&
    renderedItem !== undefined &&
    initialMeasurementPendingRef.current &&
    estimatedHeight === undefined &&
    !isMeasured
  const transitionVisible = visible && renderedItem !== undefined && !firstRenderNeedsMeasurement
  const transitionTargetRef = useRef(transitionVisible ? 1 : 0)
  transitionTargetRef.current = transitionVisible ? 1 : 0

  const notifyOpened = useCallback((item: DropdownItemRegistration | undefined) => {
    if (!item || !visibleRef.current) return
    if (openedItemIdRef.current === item.id) return
    openedItemIdRef.current = item.id
    openSettledRef.current = true
    item.onOpened?.()
  }, [])

  const finishTransition = useCallback(
    (target: number, transitionId: number) => {
      if (transitionIdRef.current !== transitionId || transitionTargetRef.current !== target) return

      if (target === 1) {
        notifyOpened(renderedItemRef.current)
        return
      }

      if (visibleRef.current || !renderedItemRef.current) return
      openSettledRef.current = false
      const item = renderedItemRef.current
      openedItemIdRef.current = undefined
      initialMeasurementPendingRef.current = false
      item.onClosed?.()
      setRenderedItem(undefined)
    },
    [notifyOpened],
  )

  useEffect(() => {
    const target = transitionVisible ? 1 : 0
    const transitionId = transitionIdRef.current + 1
    transitionIdRef.current = transitionId
    cancelAnimation(progress)

    if (!transitionVisible && visibleRef.current) {
      progress.value = 0
      return () => cancelAnimation(progress)
    }

    if (!themeToken.motion || animationDuration === 0 || progress.value === target) {
      progress.value = target
      finishTransition(target, transitionId)
      return () => cancelAnimation(progress)
    }

    const easing = target === 1 ? Easing.out(Easing.ease) : Easing.in(Easing.ease)
    progress.value = withTiming(target, { duration: animationDuration, easing }, (finished) => {
      'worklet'
      if (finished) scheduleOnRN(finishTransition, target, transitionId)
    })

    return () => cancelAnimation(progress)
  }, [animationDuration, finishTransition, progress, themeToken.motion, transitionVisible])

  const animatedPanelStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: (direction === 'down' ? -1 : 1) * panelHeight * (1 - progress.value),
        },
      ],
    }),
    [direction, panelHeight],
  )

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

  const portalContent = renderedItem ? (
    <View
      collapsable={false}
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, rootStyle, { zIndex }]}
    >
      {overlay ? (
        <OverlaySurface
          testID="dropdown-overlay"
          show={visible}
          rendered
          backgroundColor={token.overlayColor}
          zIndex={zIndex}
          onPress={closeOnPressOverlay ? onRequestClose : undefined}
          animatedStyle={animatedOverlayStyle}
          style={renderedItem.overlayStyle}
          pressableStyle={renderedItem.overlayStyle}
        />
      ) : null}
      <View
        testID="dropdown-panel-viewport"
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          {
            justifyContent: direction === 'up' ? 'flex-end' : 'flex-start',
            overflow: 'hidden',
            zIndex: (zIndex ?? token.zIndex) + 1,
          },
        ]}
      >
        <Animated.View
          testID="dropdown-panel"
          onLayout={(event) => {
            if (renderedItemRef.current?.id !== renderedItem.id) return
            const nextHeight = event.nativeEvent.layout.height
            if (nextHeight <= 0) return
            setMeasuredItemId(renderedItem.id)
            setMeasuredHeight(nextHeight)
          }}
          pointerEvents={visible ? 'auto' : 'none'}
          style={[
            {
              backgroundColor: token.contentBackgroundColor,
              width: '100%',
              zIndex: (zIndex ?? token.zIndex) + 1,
            },
            renderedItem.contentStyle,
            firstRenderNeedsMeasurement ? { opacity: 0 } : null,
            animatedPanelStyle,
          ]}
        >
          {renderedItem.content}
        </Animated.View>
      </View>
    </View>
  ) : null

  return <Portal>{portalContent}</Portal>
}

DropdownPopup.displayName = 'DropdownPopup'
