import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Easing } from 'react-native-reanimated'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
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

type TransitionState =
  'closed' | 'opening' | 'opened' | 'switching-out' | 'switching-in' | 'reopening' | 'closing'

type AnimationChannel = 'overlay' | 'panel'
type TransitionKind = Exclude<TransitionState, 'closed' | 'opened'>

interface TransitionCycle {
  id: number
  kind: TransitionKind
  overlayStarted: boolean
  panelStarted: boolean
  overlayFinished: boolean
  panelFinished: boolean
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
  const [displayItem, setDisplayItem] = useState<DropdownItemRegistration | undefined>(activeItem)
  const [transitionState, setTransitionState] = useState<TransitionState>(
    activeItem ? 'opening' : 'closed',
  )
  const [measuredItemId, setMeasuredItemId] = useState<symbol | undefined>(undefined)
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined)
  const displayItemRef = useRef(displayItem)
  const activeItemRef = useRef(activeItem)
  const pendingItemRef = useRef<DropdownItemRegistration | undefined>(undefined)
  const transitionStateRef = useRef<TransitionState>(transitionState)
  const transitionIdRef = useRef(0)
  const transitionCycleRef = useRef<TransitionCycle | undefined>(undefined)
  const openedItemIdRef = useRef<symbol | undefined>(undefined)
  const openItemsRef = useRef(new Set<symbol>())
  const visibleRef = useRef(visible)
  const panelProgress = useSharedValue(0)
  const overlayProgress = useSharedValue(0)

  displayItemRef.current = displayItem
  visibleRef.current = visible

  const updateTransitionState = useCallback((next: TransitionState) => {
    transitionStateRef.current = next
    setTransitionState(next)
  }, [])

  const signalOpen = useCallback((item: DropdownItemRegistration | undefined) => {
    if (!item || openItemsRef.current.has(item.id)) return
    openItemsRef.current.add(item.id)
    item.onOpen?.()
  }, [])

  const signalClose = useCallback((item: DropdownItemRegistration | undefined) => {
    if (!item || !openItemsRef.current.delete(item.id)) return
    item.onClose?.()
  }, [])

  const signalOpened = useCallback((item: DropdownItemRegistration | undefined) => {
    if (!item || openedItemIdRef.current === item.id) return
    openedItemIdRef.current = item.id
    item.onOpened?.()
  }, [])

  const signalClosed = useCallback((item: DropdownItemRegistration | undefined) => {
    if (!item) return
    if (openedItemIdRef.current === item.id) openedItemIdRef.current = undefined
    item.onClosed?.()
  }, [])

  const startTransitionCycle = useCallback(
    (kind: TransitionKind) => {
      cancelAnimation(panelProgress)
      if (kind !== 'switching-out' && kind !== 'switching-in' && kind !== 'reopening') {
        cancelAnimation(overlayProgress)
      } else if (kind === 'switching-out' && overlayProgress.value < 1) {
        cancelAnimation(overlayProgress)
      }

      const cycle: TransitionCycle = {
        id: ++transitionIdRef.current,
        kind,
        overlayFinished: false,
        overlayStarted: false,
        panelFinished: false,
        panelStarted: false,
      }
      transitionCycleRef.current = cycle
      return cycle
    },
    [overlayProgress, panelProgress],
  )

  const finishAnimation = useCallback(
    (id: number, channel: AnimationChannel, finished: boolean) => {
      if (!finished) return
      const cycle = transitionCycleRef.current
      if (!cycle || cycle.id !== id) return

      if (channel === 'panel') {
        if (cycle.panelFinished) return
        cycle.panelFinished = true
      } else {
        if (cycle.overlayFinished) return
        cycle.overlayFinished = true
      }

      const display = displayItemRef.current
      if (cycle.kind === 'opening' && cycle.panelFinished && cycle.overlayFinished) {
        if (!display || !visibleRef.current || activeItemRef.current?.id !== display.id) return
        updateTransitionState('opened')
        signalOpened(display)
        return
      }

      if (cycle.kind === 'reopening' && cycle.panelFinished) {
        if (!display || !visibleRef.current || activeItemRef.current?.id !== display.id) return
        updateTransitionState('opened')
        return
      }

      if (cycle.kind === 'switching-out' && cycle.panelFinished) {
        const nextItem = pendingItemRef.current ?? activeItemRef.current
        if (!display || !nextItem || nextItem.id === display.id || !visibleRef.current) return

        signalClosed(display)
        pendingItemRef.current = undefined
        displayItemRef.current = nextItem
        setDisplayItem(nextItem)
        panelProgress.value = 0
        startTransitionCycle('switching-in')
        updateTransitionState('switching-in')
        return
      }

      if (cycle.kind === 'switching-in' && cycle.panelFinished) {
        if (!display || !visibleRef.current || activeItemRef.current?.id !== display.id) return
        updateTransitionState('opened')
        signalOpened(display)
        return
      }

      if (
        cycle.kind === 'closing' &&
        cycle.panelFinished &&
        cycle.overlayFinished &&
        !visibleRef.current
      ) {
        signalClosed(display)
        displayItemRef.current = undefined
        setDisplayItem(undefined)
        pendingItemRef.current = undefined
        updateTransitionState('closed')
      }
    },
    [panelProgress, signalClosed, signalOpened, startTransitionCycle, updateTransitionState],
  )

  const animateChannel = useCallback(
    (channel: AnimationChannel, target: number, id: number) => {
      const cycle = transitionCycleRef.current
      if (!cycle || cycle.id !== id) return

      const progress = channel === 'panel' ? panelProgress : overlayProgress
      if (channel === 'panel') cycle.panelStarted = true
      else cycle.overlayStarted = true

      cancelAnimation(progress)
      if (!themeToken.motion || animationDuration === 0 || progress.value === target) {
        progress.value = target
        finishAnimation(id, channel, true)
        return
      }

      const easing = target === 1 ? Easing.out(Easing.ease) : Easing.in(Easing.ease)
      progress.value = withTiming(target, { duration: animationDuration, easing }, (finished) => {
        'worklet'
        if (finished) scheduleOnRN(finishAnimation, id, channel, true)
      })
    },
    [animationDuration, finishAnimation, overlayProgress, panelProgress, themeToken.motion],
  )

  useLayoutEffect(() => {
    activeItemRef.current = activeItem
    const display = displayItemRef.current
    const state = transitionStateRef.current

    if (!activeItem) {
      pendingItemRef.current = undefined
      if (!display) {
        updateTransitionState('closed')
        return
      }
      if (state === 'closing') return

      signalClose(display)
      startTransitionCycle('closing')
      updateTransitionState('closing')
      return
    }

    if (!display) {
      pendingItemRef.current = undefined
      displayItemRef.current = activeItem
      setDisplayItem(activeItem)
      panelProgress.value = 0
      overlayProgress.value = 0
      signalOpen(activeItem)
      startTransitionCycle('opening')
      updateTransitionState('opening')
      return
    }

    if (display.id === activeItem.id) {
      if (display !== activeItem) {
        displayItemRef.current = activeItem
        setDisplayItem(activeItem)
      }
      if (state === 'switching-out' || state === 'closing') {
        const pending = pendingItemRef.current
        pendingItemRef.current = undefined
        signalClose(pending)
        signalOpen(display)
        startTransitionCycle('reopening')
        updateTransitionState('reopening')
      } else {
        pendingItemRef.current = undefined
      }
      return
    }

    const previousPending = pendingItemRef.current
    pendingItemRef.current = activeItem
    if (previousPending && previousPending.id !== activeItem.id) signalClose(previousPending)
    signalOpen(activeItem)

    if (state === 'switching-out') return

    signalClose(display)
    startTransitionCycle('switching-out')
    updateTransitionState('switching-out')
  }, [
    activeItem,
    overlayProgress,
    panelProgress,
    signalClose,
    signalOpen,
    startTransitionCycle,
    updateTransitionState,
  ])

  useLayoutEffect(() => {
    if (!displayItem) {
      setMeasuredItemId(undefined)
      setMeasuredHeight(undefined)
      return
    }

    setMeasuredItemId(undefined)
    setMeasuredHeight(undefined)
  }, [displayItem, displayItem?.estimatedHeight, displayItem?.id])

  const displayItemId = displayItem?.id
  const estimatedHeight = displayItem?.estimatedHeight
  const isMeasured = displayItemId !== undefined && measuredItemId === displayItemId
  const panelHeight = isMeasured ? (measuredHeight ?? 0) : (estimatedHeight ?? 0)
  const needsMeasurement = displayItem !== undefined && estimatedHeight === undefined && !isMeasured
  const panelReady = !needsMeasurement

  useEffect(() => {
    const cycle = transitionCycleRef.current
    if (!cycle || !displayItem) return

    if (transitionState === 'opening' && cycle.kind === 'opening') {
      if (!cycle.overlayStarted) animateChannel('overlay', 1, cycle.id)
      if (panelReady && !cycle.panelStarted) animateChannel('panel', 1, cycle.id)
      return
    }

    if (transitionState === 'switching-out' && cycle.kind === 'switching-out') {
      if (overlayProgress.value < 1 && !cycle.overlayStarted) {
        animateChannel('overlay', 1, cycle.id)
      }
      if (!cycle.panelStarted) animateChannel('panel', 0, cycle.id)
      return
    }

    if (transitionState === 'switching-in' && cycle.kind === 'switching-in') {
      if (panelReady && !cycle.panelStarted) animateChannel('panel', 1, cycle.id)
      return
    }

    if (transitionState === 'reopening' && cycle.kind === 'reopening') {
      if (panelReady && !cycle.panelStarted) animateChannel('panel', 1, cycle.id)
      return
    }

    if (transitionState === 'closing' && cycle.kind === 'closing') {
      if (!cycle.overlayStarted) animateChannel('overlay', 0, cycle.id)
      if (!cycle.panelStarted) animateChannel('panel', 0, cycle.id)
    }
  }, [animateChannel, displayItem, overlayProgress, panelReady, transitionState])

  const animatedPanelStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: (direction === 'down' ? -1 : 1) * panelHeight * (1 - panelProgress.value),
        },
      ],
    }),
    [direction, panelHeight],
  )

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayProgress.value,
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

  const portalItem = activeItem && displayItem?.id === activeItem.id ? activeItem : displayItem
  const portalContent = portalItem ? (
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
          style={portalItem.overlayStyle}
          pressableStyle={portalItem.overlayStyle}
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
            if (displayItemRef.current?.id !== portalItem.id) return
            if (portalItem.estimatedHeight !== undefined) return
            const nextHeight = event.nativeEvent.layout.height
            if (nextHeight <= 0) return
            setMeasuredItemId(portalItem.id)
            setMeasuredHeight(nextHeight)
          }}
          pointerEvents={visible && transitionState !== 'closing' ? 'auto' : 'none'}
          style={[
            {
              backgroundColor: token.contentBackgroundColor,
              width: '100%',
              zIndex: (zIndex ?? token.zIndex) + 1,
            },
            portalItem.contentStyle,
            needsMeasurement ? { opacity: 0 } : null,
            animatedPanelStyle,
          ]}
        >
          {portalItem.content}
        </Animated.View>
      </View>
    </View>
  ) : null

  return <Portal>{portalContent}</Portal>
}

DropdownPopup.displayName = 'DropdownPopup'
