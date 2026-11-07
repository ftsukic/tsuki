import type { PanGestureHandlerEventPayload } from 'react-native-gesture-handler'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { cancelAnimation, runOnUI, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Gesture } from '../gesture'
import { animateValue } from '../motion/animation'
import { LAYOUT_PRESET } from '../motion/presets'
import { coastGestureOffset, resistGestureOffset, SWIPE_PRESET } from '../motion/gesture'
import { useMotionConfig } from '../motion/useMotionConfig'
import {
  getAnchoredImageRect,
  getDismissDistance,
  getDismissProgress,
  getDismissScale,
  getImageRect,
  getImageTransformFromRect,
} from './geometry'
import { shouldDismiss } from './utils'
import type { ImagePreviewRect } from './types'

export type ImagePreviewInteractionState =
  'idle' | 'pan' | 'paging' | 'settling' | 'pinch' | 'dismiss' | 'restoring'
type PanMode = 0 | 1 | 2 | 3
const PAN_MODE_PENDING: PanMode = 0
const PAN_MODE_HORIZONTAL: PanMode = 1
const PAN_MODE_VERTICAL: PanMode = 2
const PAN_MODE_FREE: PanMode = 3
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
function unresist(value: number, limit: number, viewport: number) {
  'worklet'
  const excess = Math.abs(value) - limit
  if (excess <= 0) return value
  const size = Math.max(1, viewport)
  const visible = Math.min(excess, size * 0.999)
  const raw = (visible * size) / (SWIPE_PRESET.resistance * (size - visible))
  return Math.sign(value) * (limit + raw)
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
  const initialIndex = Math.max(0, ids.indexOf(activeId ?? ''))
  const state = useSharedValue<ImagePreviewInteractionState>('idle')
  const revision = useSharedValue(0)
  const index = useSharedValue(initialIndex)
  const selected = useSharedValue(activeId ?? ids[0] ?? '')
  const position = useSharedValue(initialIndex * pageWidth)
  const scale = useSharedValue(1)
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const dragX = useSharedValue(0)
  const dragY = useSharedValue(0)
  const dismissMoveX = useSharedValue(0)
  const dismissMoveY = useSharedValue(0)
  const dismissStartX = useSharedValue(0)
  const dismissStartY = useSharedValue(0)
  const dismissActive = useSharedValue(false)
  const dismissBaseProgress = useSharedValue(0)
  const dismissRect = useSharedValue(images[initialIndex] ?? { x: 0, y: 0, width: 1, height: 1 })
  const dismissAnchor = useSharedValue({ x: 0, y: 0 })
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const originX = useSharedValue(0)
  const originY = useSharedValue(0)
  const panMode = useSharedValue<PanMode>(PAN_MODE_PENDING)
  const initialScale = useSharedValue(1)
  const focalX = useSharedValue(0)
  const focalY = useSharedValue(0)
  const multiple = useSharedValue(false)
  const setState = useCallback(
    (next: ImagePreviewInteractionState) => {
      'worklet'
      if (state.value === next) return
      const wasEngaged = state.value !== 'idle'
      state.value = next
      // Pager/pan/dismiss handoffs stay on UI. React only receives gesture lock changes.
      if (wasEngaged !== (next !== 'idle')) scheduleOnRN(onStateChange, next)
    },
    [state, onStateChange],
  )
  const stop = useCallback(() => {
    'worklet'
    revision.value += 1
    for (const value of [position, scale, x, y, dragX, dragY, dismissMoveX, dismissMoveY])
      cancelAnimation(value)
  }, [revision, position, scale, x, y, dragX, dragY, dismissMoveX, dismissMoveY])
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
        panMode.value = PAN_MODE_PENDING
        index.value = target
        selected.value = ids[target]
        scheduleOnRN(onSelect, ids[target])
      }
      position.value = target * pageWidth
    },
    [ids, selected, scale, x, y, index, position, onSelect, pageWidth, panMode],
  )
  const rebaseDismiss = useCallback(() => {
    'worklet'
    if (!dismissActive.value) return
    const image = images[index.value]
    if (!image) {
      dismissActive.value = false
      dismissBaseProgress.value = 0
      dragX.value = 0
      dragY.value = 0
      dismissMoveX.value = 0
      dismissMoveY.value = 0
      dismissStartX.value = 0
      dismissStartY.value = 0
      panMode.value = PAN_MODE_PENDING
      return
    }
    const baseProgress = dismissBaseProgress.value
    const progress = getDismissProgress(
      dragY.value - dismissStartY.value,
      host.height,
      baseProgress,
    )
    const actual = getAnchoredImageRect(
      dismissRect.value,
      dismissAnchor.value,
      { x: dismissMoveX.value, y: dismissMoveY.value },
      getDismissScale(progress) / getDismissScale(baseProgress),
    )
    const transform = getImageTransformFromRect(actual, image, host)
    scale.value = transform.scale
    x.value = transform.x
    y.value = transform.y
    dragX.value = 0
    dragY.value = 0
    dismissMoveX.value = 0
    dismissMoveY.value = 0
    dismissStartX.value = 0
    dismissStartY.value = 0
    dismissActive.value = false
    dismissBaseProgress.value = 0
    panMode.value = PAN_MODE_PENDING
  }, [
    dismissActive,
    dismissBaseProgress,
    images,
    index,
    dismissRect,
    dismissAnchor,
    dragX,
    dragY,
    dismissMoveX,
    dismissMoveY,
    dismissStartX,
    dismissStartY,
    panMode,
    host,
    scale,
    x,
    y,
  ])
  const takeOver = useCallback(() => {
    'worklet'
    stop()
    rebaseDismiss()
    choose(Math.round(position.value / pageWidth))
    dragX.value = 0
    dragY.value = 0
    dismissMoveX.value = 0
    dismissMoveY.value = 0
    dismissStartX.value = 0
    dismissStartY.value = 0
    dismissActive.value = false
    dismissBaseProgress.value = 0
    panMode.value = PAN_MODE_PENDING
    return images[index.value]
  }, [
    stop,
    rebaseDismiss,
    choose,
    position,
    pageWidth,
    dragX,
    dragY,
    dismissMoveX,
    dismissMoveY,
    dismissStartX,
    dismissStartY,
    dismissActive,
    dismissBaseProgress,
    panMode,
    images,
    index,
  ])
  const reset = useCallback(() => {
    'worklet'
    stop()
    scale.value = 1
    x.value = 0
    y.value = 0
    dragX.value = 0
    dragY.value = 0
    dismissActive.value = false
    dismissBaseProgress.value = 0
    dismissAnchor.value = { x: 0, y: 0 }
    dismissMoveX.value = 0
    dismissMoveY.value = 0
    dismissStartX.value = 0
    dismissStartY.value = 0
    panMode.value = PAN_MODE_PENDING
    position.value = index.value * pageWidth
    setState('idle')
  }, [
    stop,
    scale,
    x,
    y,
    dragX,
    dragY,
    dismissActive,
    dismissBaseProgress,
    dismissAnchor,
    dismissMoveX,
    dismissMoveY,
    dismissStartX,
    dismissStartY,
    panMode,
    position,
    index,
    pageWidth,
    setState,
  ])
  const restore = useCallback(() => {
    'worklet'
    stop()
    const generation = revision.value
    const baseProgress = dismissActive.value ? dismissBaseProgress.value : 0
    const targetY = baseProgress > 0 ? -baseProgress * getDismissDistance(host.height) : 0
    const targetDragY = dismissStartY.value + targetY
    setState('restoring')
    dragX.value = animate ? animateValue(0, { ...LAYOUT_PRESET, duration }) : 0
    dismissMoveX.value = animate ? animateValue(0, { ...LAYOUT_PRESET, duration }) : 0
    dismissMoveY.value = animate ? animateValue(targetY, { ...LAYOUT_PRESET, duration }) : targetY
    const finish = (finished?: boolean) => {
      'worklet'
      if (finished && generation === revision.value) {
        if (dismissActive.value) {
          const targetRect = getAnchoredImageRect(
            dismissRect.value,
            dismissAnchor.value,
            { x: dismissMoveX.value, y: dismissMoveY.value },
            getDismissScale(0) / getDismissScale(baseProgress),
          )
          const image = images[index.value]
          if (image) {
            const transform = getImageTransformFromRect(targetRect, image, host)
            scale.value = transform.scale
            x.value = transform.x
            y.value = transform.y
          }
        }
        dragX.value = 0
        dragY.value = targetDragY
        dismissMoveX.value = 0
        dismissMoveY.value = 0
        dismissStartX.value = 0
        dismissStartY.value = 0
        dismissActive.value = false
        dismissBaseProgress.value = 0
        setState('idle')
      }
    }
    dragY.value = animate
      ? animateValue(targetDragY, { ...LAYOUT_PRESET, duration }, finish)
      : targetDragY
    if (!animate) finish(true)
  }, [
    stop,
    revision,
    setState,
    dragX,
    dragY,
    dismissMoveX,
    dismissMoveY,
    dismissStartX,
    dismissStartY,
    dismissActive,
    dismissBaseProgress,
    dismissRect,
    dismissAnchor,
    images,
    index,
    host,
    scale,
    x,
    y,
    animate,
    duration,
  ])
  const settlePage = useCallback(
    (next: number, immediate = false, verticalVelocity = 0) => {
      'worklet'
      stop()
      rebaseDismiss()
      const generation = revision.value
      setState('settling')
      const finish = (finished?: boolean) => {
        'worklet'
        if (!finished || generation !== revision.value) return
        const currentIndex = index.value
        const targetIndex = Math.max(0, Math.min(ids.length - 1, next))
        choose(next)
        if (targetIndex === currentIndex && panMode.value === PAN_MODE_FREE) {
          const image = images[currentIndex]
          if (image)
            y.value = coastGestureOffset(
              y.value,
              verticalVelocity,
              Math.max(0, (image.height * scale.value - host.height) / 2),
              animate,
              durationScale,
            )
        }
        setState('idle')
      }
      const target = Math.max(0, Math.min(ids.length - 1, next)) * pageWidth
      position.value =
        animate && !immediate
          ? animateValue(target, { ...LAYOUT_PRESET, duration }, finish)
          : target
      if (!animate || immediate) finish(true)
    },
    [
      stop,
      rebaseDismiss,
      revision,
      setState,
      choose,
      ids.length,
      pageWidth,
      position,
      index,
      panMode,
      images,
      y,
      scale,
      host,
      animate,
      duration,
      durationScale,
    ],
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
    (event: PanGestureHandlerEventPayload, finalPosition = false) => {
      'worklet'
      if (multiple.value || state.value === 'pinch') return
      let image = images[index.value]
      if (!image) return
      const dx =
        finalPosition && Number.isFinite(event.absoluteX) && Number.isFinite(originX.value)
          ? event.absoluteX - originX.value
          : Number.isFinite(event.translationX)
            ? event.translationX
            : event.absoluteX - originX.value
      const dy =
        finalPosition && Number.isFinite(event.absoluteY) && Number.isFinite(originY.value)
          ? event.absoluteY - originY.value
          : Number.isFinite(event.translationY)
            ? event.translationY
            : event.absoluteY - originY.value
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return
      const touchX = originX.value - host.x + dx
      const touchY = originY.value - host.y + dy
      if (panMode.value === PAN_MODE_PENDING) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PRESET.activationDistance) return
        panMode.value = dismissActive.value
          ? PAN_MODE_FREE
          : scale.value > 1.01
            ? PAN_MODE_FREE
            : Math.abs(dx) > Math.abs(dy)
              ? PAN_MODE_HORIZONTAL
              : PAN_MODE_VERTICAL
        if (
          panMode.value === PAN_MODE_VERTICAL &&
          Math.abs(position.value - index.value * pageWidth) > 1
        ) {
          image = takeOver()
          if (!image) return
          panMode.value = PAN_MODE_VERTICAL
          startX.value = x.value
          startY.value = y.value
        }
      }

      if (dismissActive.value) {
        const delta = {
          x: touchX - dismissAnchor.value.x,
          y: touchY - dismissAnchor.value.y,
        }
        const baseProgress = dismissBaseProgress.value
        const currentDragX = dismissStartX.value + delta.x
        const currentDragY = dismissStartY.value + delta.y
        const progress = getDismissProgress(
          currentDragY - dismissStartY.value,
          host.height,
          baseProgress,
        )
        if (progress <= 0) {
          const actual = getAnchoredImageRect(
            dismissRect.value,
            dismissAnchor.value,
            delta,
            getDismissScale(progress) / getDismissScale(baseProgress),
          )
          const transform = getImageTransformFromRect(actual, image, host)
          scale.value = transform.scale
          x.value = transform.x
          y.value = transform.y
          dragX.value = 0
          dragY.value = 0
          dismissMoveX.value = 0
          dismissMoveY.value = 0
          dismissStartX.value = 0
          dismissStartY.value = 0
          dismissActive.value = false
          dismissBaseProgress.value = 0
          panMode.value = PAN_MODE_FREE
          startX.value =
            unresist(
              x.value,
              Math.max(0, (image.width * scale.value - host.width) / 2),
              host.width,
            ) - dx
          startY.value =
            unresist(
              y.value,
              Math.max(0, (image.height * scale.value - host.height) / 2),
              host.height,
            ) - dy
          setState('pan')
        } else {
          dismissMoveX.value = delta.x
          dismissMoveY.value = delta.y
          dragX.value = currentDragX
          dragY.value = currentDragY
          setState('dismiss')
        }
        return
      }

      const base = index.value * pageWidth
      if (panMode.value === PAN_MODE_HORIZONTAL) {
        const raw = startX.value + dx
        const horizontalLimit = Math.max(0, (image.width * scale.value - host.width) / 2)
        const boundedX = bound(raw, image.width, host.width, scale.value)
        const excess = raw - boundedX
        const hasNeighbor = excess < 0 ? index.value < ids.length - 1 : index.value > 0
        if (excess && hasNeighbor) {
          x.value = boundedX
          position.value = Math.max(
            Math.max(0, base - pageWidth),
            Math.min((ids.length - 1) * pageWidth, base + pageWidth, base - excess),
          )
        } else {
          x.value = resistGestureOffset(raw, horizontalLimit, host.width)
          position.value = base
        }
        setState(position.value === base ? 'pan' : 'paging')
        return
      }

      const rawX = startX.value + dx
      const horizontalLimit = Math.max(0, (image.width * scale.value - host.width) / 2)
      const rawY = startY.value + dy
      const verticalLimit = Math.max(0, (image.height * scale.value - host.height) / 2)
      let overflowX = 0
      let overflowY = 0
      if (panMode.value === PAN_MODE_VERTICAL) {
        position.value = base
        const dismissing = closeOnGesture && rawY > verticalLimit && dy > Math.abs(dx)
        if (!dismissing) {
          x.value = resistGestureOffset(rawX, horizontalLimit, host.width)
          y.value = resistGestureOffset(rawY, verticalLimit, host.height)
          dragX.value = 0
          dragY.value = 0
          dismissBaseProgress.value = 0
          setState('pan')
          return
        }
        const boundedX = bound(rawX, image.width, host.width, scale.value)
        overflowX = rawX - boundedX
        overflowY = rawY - verticalLimit
        x.value = boundedX
        y.value = verticalLimit
      } else {
        const boundedX = bound(rawX, image.width, host.width, scale.value)
        overflowX = rawX - boundedX
        const hasNeighbor = overflowX < 0 ? index.value < ids.length - 1 : index.value > 0
        const dismissing = closeOnGesture && rawY > verticalLimit && dy > Math.abs(dx)
        if (!dismissing && overflowX && hasNeighbor) {
          x.value = boundedX
          position.value = Math.max(
            Math.max(0, base - pageWidth),
            Math.min((ids.length - 1) * pageWidth, base + pageWidth, base - overflowX),
          )
          y.value = resistGestureOffset(rawY, verticalLimit, host.height)
          dragX.value = 0
          dragY.value = 0
          dismissBaseProgress.value = 0
          setState('paging')
          return
        }
        x.value = resistGestureOffset(rawX, horizontalLimit, host.width)
        position.value = base
        if (!dismissing) {
          y.value = resistGestureOffset(rawY, verticalLimit, host.height)
          dragX.value = 0
          dragY.value = 0
          dismissBaseProgress.value = 0
          setState('pan')
          return
        }
        if (dismissing) {
          x.value = boundedX
          position.value = base
        }
        overflowY = rawY - verticalLimit
      }

      y.value = verticalLimit
      dismissRect.value = getImageRect(image, host, scale.value, x.value, verticalLimit)
      dismissAnchor.value = { x: touchX - overflowX, y: touchY - overflowY }
      dismissMoveX.value = overflowX
      dismissMoveY.value = overflowY
      dragX.value = overflowX
      dragY.value = overflowY
      dismissStartX.value = 0
      dismissStartY.value = 0
      dismissBaseProgress.value = 0
      dismissActive.value = true
      setState('dismiss')
    },
    [
      originX,
      originY,
      multiple,
      state,
      images,
      index,
      host,
      panMode,
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
      dismissMoveX,
      dismissMoveY,
      dismissStartX,
      dismissStartY,
      dismissActive,
      dismissBaseProgress,
      dismissRect,
      dismissAnchor,
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
          const wasDismissing = dismissActive.value
          const dismissedProgress = wasDismissing
            ? getDismissProgress(
                dragY.value - dismissStartY.value,
                host.height,
                dismissBaseProgress.value,
              )
            : 0
          stop()
          rebaseDismiss()
          const image = images[index.value]
          if (wasDismissing && image) {
            dismissRect.value = getImageRect(image, host, scale.value, x.value, y.value)
            dismissAnchor.value = { x: originX.value - host.x, y: originY.value - host.y }
            dragX.value = 0
            dragY.value = 0
            dismissMoveX.value = 0
            dismissMoveY.value = 0
            dismissStartX.value = 0
            dismissStartY.value = 0
            dismissBaseProgress.value = dismissedProgress
            dismissActive.value = true
          }
          panMode.value = wasDismissing ? PAN_MODE_FREE : PAN_MODE_PENDING
          // Include the unconsumed page displacement, so reverse movement naturally returns to the image.
          const horizontalLimit = image
            ? Math.max(0, (image.width * scale.value - host.width) / 2)
            : 0
          const verticalLimit = image
            ? Math.max(0, (image.height * scale.value - host.height) / 2)
            : 0
          startX.value =
            (wasDismissing ? unresist(x.value, horizontalLimit, host.width) : x.value) -
            (position.value - index.value * pageWidth)
          startY.value = wasDismissing ? unresist(y.value, verticalLimit, host.height) : y.value
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
            updatePan(event, true)
          if (state.value === 'paging') {
            const distance = position.value - index.value * pageWidth
            const fling =
              Math.abs(event.velocityX) > SWIPE_PRESET.velocityThreshold &&
              event.velocityX * distance < 0
            const change =
              success && (Math.abs(distance) > host.width * SWIPE_PRESET.threshold || fling)
            settlePage(
              index.value + (change ? (distance > 0 ? 1 : -1) : 0),
              false,
              success && panMode.value === PAN_MODE_FREE ? event.velocityY : 0,
            )
          } else if (state.value === 'dismiss') {
            if (
              success &&
              shouldDismiss({
                translationY:
                  getDismissProgress(
                    dragY.value - dismissStartY.value,
                    host.height,
                    dismissBaseProgress.value,
                  ) * getDismissDistance(host.height),
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
      rebaseDismiss,
      images,
      index,
      dismissActive,
      dismissBaseProgress,
      dismissRect,
      dismissAnchor,
      dragX,
      dragY,
      dismissMoveX,
      dismissMoveY,
      dismissStartX,
      dismissStartY,
      host,
      scale,
      panMode,
      startX,
      startY,
      x,
      y,
      position,
      pageWidth,
      setState,
      state,
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
    if (!dismissActive.value) return getImageRect(image, host, scale.value, x.value, y.value)
    const baseProgress = dismissBaseProgress.value
    const progress = getDismissProgress(
      dragY.value - dismissStartY.value,
      host.height,
      baseProgress,
    )
    return getAnchoredImageRect(
      dismissRect.value,
      dismissAnchor.value,
      { x: dismissMoveX.value, y: dismissMoveY.value },
      getDismissScale(progress) / getDismissScale(baseProgress),
    )
  }, [
    images,
    host,
    dismissActive,
    dismissBaseProgress,
    dismissRect,
    dismissAnchor,
    dragX,
    dragY,
    dismissMoveX,
    dismissMoveY,
    dismissStartX,
    dismissStartY,
    scale,
    x,
    y,
  ])
  const dismissProgress = useDerivedValue(
    () =>
      dismissActive.value
        ? getDismissProgress(
            dragY.value - dismissStartY.value,
            host.height,
            dismissBaseProgress.value,
          )
        : 0,
    [dismissActive, dismissBaseProgress, dragY, dismissStartY, host.height],
  )
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
    dismissProgress,
    rect,
    reset,
    restore,
    stop,
    settlePage,
  }
}
