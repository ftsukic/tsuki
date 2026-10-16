import type { PanGestureHandlerEventPayload } from 'react-native-gesture-handler'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { cancelAnimation, runOnUI, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Gesture } from '../gesture'
import { animateValue } from '../motion/animation'
import { LAYOUT_PRESET } from '../motion/presets'
import { coastGestureOffset, resistGestureOffset, SWIPE_PRESET } from '../motion/gesture'
import { useMotionConfig } from '../motion/useMotionConfig'
import { shouldDismiss } from './utils'
import type { ImagePreviewRect } from './types'

export type ImagePreviewInteractionState =
  'idle' | 'pan' | 'paging' | 'settling' | 'pinch' | 'dismiss' | 'restoring'
interface Options {
  enabled: boolean
  ids: string[]
  images: ImagePreviewRect[]
  activeId: string | undefined
  viewport: ImagePreviewRect
  pageWidth: number
  closeOnGesture: boolean
  onSelect: (id: string) => void
  onClose: (reason: 'image' | 'gesture') => void
  onLongPress: () => void
  onStateChange: (state: ImagePreviewInteractionState) => void
}
function bound(value: number, image: number, viewport: number, scale: number) {
  'worklet'
  const limit = Math.max(0, (image * scale - viewport) / 2)
  return limit === 0 ? 0 : Math.max(-limit, Math.min(limit, value))
}
function focal(
  f: number,
  initial: number,
  offset: number,
  before: number,
  after: number,
  size: number,
) {
  'worklet'
  return f - size / 2 - ((initial - size / 2 - offset) * after) / before
}

/** One UI-thread owner drives every page, including unzoomed horizontal movement. */
export function useImagePreviewInteraction(options: Options) {
  const {
    enabled,
    ids,
    images,
    activeId,
    viewport: host,
    pageWidth,
    closeOnGesture,
    onSelect,
    onClose,
    onLongPress,
    onStateChange,
  } = options
  const motion = useMotionConfig()
  const duration = motion.duration()
  const animate = motion.enabled
  const durationScale = motion.durationScale
  const state = useSharedValue<ImagePreviewInteractionState>('idle')
  const revision = useSharedValue(0)
  const index = useSharedValue(Math.max(0, ids.indexOf(activeId ?? '')))
  const selected = useSharedValue(activeId ?? ids[0] ?? '')
  const position = useSharedValue(index.value * pageWidth)
  const scale = useSharedValue(1)
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const dragX = useSharedValue(0)
  const dragY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const originX = useSharedValue(0)
  const originY = useSharedValue(0)
  const axis = useSharedValue(0)
  const initialScale = useSharedValue(1)
  const focalX = useSharedValue(0)
  const focalY = useSharedValue(0)
  const multiple = useSharedValue(false)
  const setState = useCallback(
    (next: ImagePreviewInteractionState) => {
      'worklet'
      if (state.value === next) return
      state.value = next
      scheduleOnRN(onStateChange, next)
    },
    [state, onStateChange],
  )
  const stop = useCallback(() => {
    'worklet'
    revision.value += 1
    for (const value of [position, scale, x, y, dragX, dragY]) cancelAnimation(value)
  }, [revision, position, scale, x, y, dragX, dragY])
  useEffect(
    () => () => {
      runOnUI(stop)()
    },
    [stop],
  )
  const choose = useCallback(
    (next: number) => {
      'worklet'
      const target = Math.max(0, Math.min(ids.length - 1, next))
      if (!ids[target]) return
      if (selected.value !== ids[target]) {
        scale.value = 1
        x.value = 0
        y.value = 0
        index.value = target
        selected.value = ids[target]
        scheduleOnRN(onSelect, ids[target])
      }
      position.value = target * pageWidth
    },
    [ids, selected, scale, x, y, index, position, onSelect, pageWidth],
  )
  const takeOver = useCallback(() => {
    'worklet'
    stop()
    choose(Math.round(position.value / pageWidth))
    dragX.value = 0
    dragY.value = 0
    return images[index.value]
  }, [stop, choose, position, pageWidth, dragX, dragY, images, index])
  const reset = useCallback(() => {
    'worklet'
    stop()
    scale.value = 1
    x.value = 0
    y.value = 0
    dragX.value = 0
    dragY.value = 0
    position.value = index.value * pageWidth
    setState('idle')
  }, [stop, scale, x, y, dragX, dragY, position, index, pageWidth, setState])
  const restore = useCallback(() => {
    'worklet'
    stop()
    const generation = revision.value
    setState('restoring')
    dragX.value = animate ? animateValue(0, { ...LAYOUT_PRESET, duration }) : 0
    const finish = (finished?: boolean) => {
      'worklet'
      if (finished && generation === revision.value) setState('idle')
    }
    dragY.value = animate ? animateValue(0, { ...LAYOUT_PRESET, duration }, finish) : 0
    if (!animate) finish(true)
  }, [stop, revision, setState, dragX, dragY, animate, duration])
  const settlePage = useCallback(
    (next: number, immediate = false) => {
      'worklet'
      stop()
      const generation = revision.value
      setState('settling')
      const finish = (finished?: boolean) => {
        'worklet'
        if (!finished || generation !== revision.value) return
        choose(next)
        setState('idle')
      }
      const target = Math.max(0, Math.min(ids.length - 1, next)) * pageWidth
      position.value =
        animate && !immediate
          ? animateValue(target, { ...LAYOUT_PRESET, duration }, finish)
          : target
      if (!animate || immediate) finish(true)
    },
    [stop, revision, setState, choose, ids.length, pageWidth, position, animate, duration],
  )
  // A data prepend changes the index, not the selected media. A new external id resets the view.
  const layout = useRef({ width: host.width, height: host.height, pageWidth })
  useLayoutEffect(() => {
    const next = Math.max(0, ids.indexOf(activeId ?? ''))
    const resized =
      layout.current.width !== host.width ||
      layout.current.height !== host.height ||
      layout.current.pageWidth !== pageWidth
    layout.current = { width: host.width, height: host.height, pageWidth }
    if (resized || selected.value !== activeId || index.value !== next) {
      reset()
      index.value = next
      selected.value = activeId ?? ids[next] ?? ''
      position.value = next * pageWidth
    }
  }, [activeId, ids, host.width, host.height, pageWidth, reset, selected, index, position])

  const updatePan = useCallback(
    (event: PanGestureHandlerEventPayload) => {
      'worklet'
      if (multiple.value || state.value === 'pinch') return
      let image = images[index.value]
      if (!image) return
      const dx =
        Number.isFinite(event.absoluteX) && Number.isFinite(originX.value)
          ? event.absoluteX - originX.value
          : event.translationX
      const dy =
        Number.isFinite(event.absoluteY) && Number.isFinite(originY.value)
          ? event.absoluteY - originY.value
          : event.translationY
      if (!axis.value) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PRESET.activationDistance) return
        axis.value = Math.abs(dx) > Math.abs(dy) ? 1 : 2
        if (axis.value === 2 && Math.abs(position.value - index.value * pageWidth) > 1) {
          image = takeOver()
          if (!image) return
          startY.value = y.value
        }
      }
      if (axis.value === 1) {
        const raw = startX.value + dx
        x.value = bound(raw, image.width, host.width, scale.value)
        const excess = raw - x.value
        const base = index.value * pageWidth
        const target = Math.max(
          Math.max(0, base - pageWidth),
          Math.min((ids.length - 1) * pageWidth, base + pageWidth, base - excess),
        )
        position.value = target
        if (target === base && excess !== 0)
          x.value = resistGestureOffset(
            raw,
            Math.max(0, (image.width * scale.value - host.width) / 2),
            host.width,
          )
        setState(target === base ? 'pan' : 'paging')
      } else {
        const raw = startY.value + dy
        const edge = Math.max(0, (image.height * scale.value - host.height) / 2)
        if (closeOnGesture && raw > edge && dy > Math.abs(dx)) {
          y.value = edge
          dragX.value = dx * 0.25
          dragY.value = raw - edge
          setState('dismiss')
        } else {
          dragX.value = 0
          dragY.value = 0
          y.value = resistGestureOffset(raw, edge, host.height)
          setState('pan')
        }
      }
    },
    [
      originX,
      originY,
      multiple,
      state,
      images,
      index,
      host,
      axis,
      startX,
      startY,
      x,
      y,
      position,
      pageWidth,
      scale,
      ids.length,
      setState,
      closeOnGesture,
      dragX,
      dragY,
      takeOver,
    ],
  )
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .maxPointers(1)
        .minDistance(SWIPE_PRESET.activationDistance)
        .onTouchesDown((event) => {
          'worklet'
          multiple.value = event.numberOfTouches > 1
        })
        .onBegin((event) => {
          'worklet'
          originX.value = event.absoluteX
          originY.value = event.absoluteY
        })
        .onStart((event) => {
          'worklet'
          if (multiple.value) return
          stop()
          axis.value = 0
          // Include the unconsumed page displacement, so reverse movement naturally returns to the image.
          startX.value = x.value - (position.value - index.value * pageWidth)
          startY.value = y.value
          setState('pan')
          if (Number.isFinite(event.absoluteX) || Number.isFinite(event.translationX))
            updatePan(event)
        })
        .onUpdate(updatePan)
        .onFinalize((event, success) => {
          'worklet'
          if (
            multiple.value ||
            state.value === 'pinch' ||
            !['pan', 'paging', 'dismiss'].includes(state.value)
          )
            return
          if (success && (Number.isFinite(event.absoluteX) || Number.isFinite(event.translationX)))
            updatePan(event)
          if (state.value === 'paging') {
            const distance = position.value - index.value * pageWidth
            const fling =
              Math.abs(event.velocityX) > SWIPE_PRESET.velocityThreshold &&
              event.velocityX * distance < 0
            const change =
              success && (Math.abs(distance) > host.width * SWIPE_PRESET.threshold || fling)
            settlePage(index.value + (change ? (distance > 0 ? 1 : -1) : 0))
          } else if (state.value === 'dismiss') {
            if (
              success &&
              shouldDismiss({
                translationY: dragY.value,
                velocityY: event.velocityY,
                viewportHeight: host.height,
              })
            )
              scheduleOnRN(onClose, 'gesture')
            else restore()
          } else {
            const image = images[index.value]
            if (!image) return
            x.value = coastGestureOffset(
              x.value,
              success ? event.velocityX : 0,
              Math.max(0, (image.width * scale.value - host.width) / 2),
              animate,
              durationScale,
            )
            y.value = coastGestureOffset(
              y.value,
              success ? event.velocityY : 0,
              Math.max(0, (image.height * scale.value - host.height) / 2),
              animate,
              durationScale,
            )
            setState('idle')
          }
        }),
    [
      enabled,
      updatePan,
      originX,
      originY,
      multiple,
      stop,
      axis,
      startX,
      startY,
      x,
      y,
      position,
      index,
      pageWidth,
      setState,
      images,
      state,
      host,
      scale,
      dragY,
      settlePage,
      onClose,
      restore,
      animate,
      durationScale,
    ],
  )
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(enabled)
        .onTouchesDown((event) => {
          'worklet'
          multiple.value = event.numberOfTouches > 1
        })
        .onTouchesUp((event, manager) => {
          'worklet'
          if (event.numberOfTouches < 2) manager.end()
        })
        .onStart((event) => {
          'worklet'
          takeOver()
          multiple.value = true
          setState('pinch')
          initialScale.value = scale.value
          startX.value = x.value
          startY.value = y.value
          focalX.value = event.focalX
          focalY.value = event.focalY
        })
        .onUpdate((event) => {
          'worklet'
          if (state.value !== 'pinch' || event.numberOfPointers === 1 || event.numberOfPointers > 2)
            return
          const next = Math.max(0.5, Math.min(4, initialScale.value * event.scale))
          x.value = focal(
            event.focalX,
            focalX.value,
            startX.value,
            initialScale.value,
            next,
            host.width,
          )
          y.value = focal(
            event.focalY,
            focalY.value,
            startY.value,
            initialScale.value,
            next,
            host.height,
          )
          scale.value = next
        })
        .onFinalize(() => {
          'worklet'
          if (state.value !== 'pinch') return
          const image = images[index.value]
          if (!image) return
          const next = Math.max(1, scale.value)
          const tx = bound(x.value, image.width, host.width, next),
            ty = bound(y.value, image.height, host.height, next)
          const generation = revision.value
          setState('restoring')
          x.value = animate ? animateValue(tx, { ...LAYOUT_PRESET, duration }) : tx
          y.value = animate ? animateValue(ty, { ...LAYOUT_PRESET, duration }) : ty
          const finish = (finished?: boolean) => {
            'worklet'
            if (finished && generation === revision.value) setState('idle')
          }
          scale.value = animate ? animateValue(next, { ...LAYOUT_PRESET, duration }, finish) : next
          if (!animate) finish(true)
        }),
    [
      enabled,
      multiple,
      takeOver,
      setState,
      initialScale,
      scale,
      startX,
      startY,
      x,
      y,
      focalX,
      focalY,
      state,
      host,
      images,
      index,
      revision,
      animate,
      duration,
    ],
  )
  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(enabled)
        .numberOfTaps(2)
        .maxDistance(10)
        .onTouchesDown((event) => {
          'worklet'
          multiple.value = event.numberOfTouches > 1
        })
        .onEnd((event, success) => {
          'worklet'
          if (!success || multiple.value) return
          const image = takeOver()
          if (!image) return
          const next = scale.value > 1.01 ? 1 : 2
          const px = event.absoluteX - host.x,
            py = event.absoluteY - host.y
          const tx =
            next === 1
              ? 0
              : bound(
                  focal(px, px, x.value, scale.value, next, host.width),
                  image.width,
                  host.width,
                  next,
                )
          const ty =
            next === 1
              ? 0
              : bound(
                  focal(py, py, y.value, scale.value, next, host.height),
                  image.height,
                  host.height,
                  next,
                )
          setState('restoring')
          const generation = revision.value
          x.value = animate ? animateValue(tx, { ...LAYOUT_PRESET, duration }) : tx
          y.value = animate ? animateValue(ty, { ...LAYOUT_PRESET, duration }) : ty
          const finish = (finished?: boolean) => {
            'worklet'
            if (finished && generation === revision.value) setState('idle')
          }
          scale.value = animate ? animateValue(next, { ...LAYOUT_PRESET, duration }, finish) : next
          if (!animate) finish(true)
        }),
    [enabled, multiple, takeOver, scale, host, x, y, setState, revision, animate, duration],
  )
  const singleTap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(enabled)
        .maxDistance(10)
        .onTouchesDown((event) => {
          'worklet'
          multiple.value = event.numberOfTouches > 1
        })
        .onEnd((_event, success) => {
          'worklet'
          if (success && !multiple.value && state.value === 'idle') scheduleOnRN(onClose, 'image')
        }),
    [enabled, multiple, state, onClose],
  )
  const longPress = useMemo(
    () =>
      Gesture.LongPress()
        .enabled(enabled)
        .minDuration(500)
        .maxDistance(10)
        .onStart(() => {
          'worklet'
          if (!multiple.value && state.value === 'idle') scheduleOnRN(onLongPress)
        }),
    [enabled, multiple, state, onLongPress],
  )
  const gesture = useMemo(
    () =>
      Gesture.Race(
        Gesture.Simultaneous(pan, pinch),
        Gesture.Exclusive(longPress, doubleTap, singleTap),
      ),
    [pan, pinch, longPress, doubleTap, singleTap],
  )
  const rect = useDerivedValue(() => {
    const image = images[index.value] ?? { x: 0, y: 0, width: host.width, height: host.height }
    const factor = scale.value * Math.max(0.65, 1 - dragY.value / (host.height * 1.5))
    const width = image.width * factor,
      height = image.height * factor
    return {
      x: (host.width - width) / 2 + x.value + dragX.value,
      y: (host.height - height) / 2 + y.value + dragY.value,
      width,
      height,
    }
  }, [images, host])
  return {
    gesture,
    pan,
    pinch,
    doubleTap,
    singleTap,
    longPress,
    state,
    index,
    selected,
    position,
    scale,
    x,
    y,
    dragX,
    dragY,
    rect,
    reset,
    restore,
    stop,
    settlePage,
  }
}
