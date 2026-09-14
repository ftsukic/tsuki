import { useCallback, useMemo, useRef, useState } from 'react'
import { useAnimatedReaction } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Gesture } from '../gesture'
import { useAnimatedStyle, useSharedValue, withSpring } from '../animation'
import type { GestureType } from 'react-native-gesture-handler'
import type { ImagePreviewCloseReason, ImagePreviewRect } from './types'
import type { NormalizedImage } from './utils'
import {
  calculateFocalPointTranslation,
  clampTranslation,
  getCachedImageDimensions,
  getContainSize,
  getZoomBoundX,
  getZoomBoundY,
  interpolateClamped,
  shouldAcceptFocalPoint,
  shouldDismiss,
} from './utils'

const EPSILON = 0.01
const DISMISS_RESISTANCE = 1.5
const SPRING_CONFIG = {
  damping: 38,
  mass: 0.8,
  stiffness: 360,
}

interface ImagePreviewGestureOptions {
  activeIndex: number
  normalized?: NormalizedImage
  viewportWidth: number
  viewportHeight: number
  minZoom: number
  maxZoom: number
  doubleTapZoom: number
  closeOnPressImage: boolean
  closeOnPressOverlay: boolean
  closeOnGesture: boolean
  enabled: boolean
  onRequestClose?: (reason: ImagePreviewCloseReason, fromRect?: ImagePreviewRect) => void
  onScale?: (params: { index: number; scale: number }) => void
}

function getInitialImageSize(
  normalized: NormalizedImage | undefined,
  viewportWidth: number,
  viewportHeight: number,
) {
  const cached = normalized ? getCachedImageDimensions(normalized) : undefined
  return getContainSize(
    normalized?.width ?? cached?.width ?? viewportWidth,
    normalized?.height ?? cached?.height ?? viewportHeight,
    viewportWidth,
    viewportHeight,
  )
}

function applyRubberBandScale(value: number, minZoom: number, maxZoom: number) {
  'worklet'

  if (value < minZoom) return minZoom - (minZoom - value) * 0.2
  if (value > maxZoom) return maxZoom + (value - maxZoom) * 0.2
  return value
}

export function useImagePreviewGesture({
  activeIndex,
  normalized,
  viewportWidth,
  viewportHeight,
  minZoom,
  maxZoom,
  doubleTapZoom,
  closeOnPressImage,
  closeOnPressOverlay,
  closeOnGesture,
  enabled,
  onRequestClose,
  onScale,
}: ImagePreviewGestureOptions) {
  const initialSize = useMemo(
    () => getInitialImageSize(normalized, viewportWidth, viewportHeight),
    [normalized, viewportHeight, viewportWidth],
  )
  const scaleSV = useSharedValue(1)
  const translateXSV = useSharedValue(0)
  const translateYSV = useSharedValue(0)
  const dismissTranslateYSV = useSharedValue(0)
  const pinchStartScaleSV = useSharedValue(1)
  const pinchStartTranslateXSV = useSharedValue(0)
  const pinchStartTranslateYSV = useSharedValue(0)
  const pinchStartFocalXSV = useSharedValue(viewportWidth / 2)
  const pinchStartFocalYSV = useSharedValue(viewportHeight / 2)
  const pinchLastFocalXSV = useSharedValue(viewportWidth / 2)
  const pinchLastFocalYSV = useSharedValue(viewportHeight / 2)
  const panStartXSV = useSharedValue(0)
  const panStartYSV = useSharedValue(0)
  const baseWidthSV = useSharedValue(initialSize.width)
  const baseHeightSV = useSharedValue(initialSize.height)
  const dismissGestureRef = useRef<GestureType | undefined>(undefined)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isPinching, setIsPinching] = useState(false)
  const onRequestCloseRef = useRef(onRequestClose)
  const onScaleRef = useRef(onScale)

  onRequestCloseRef.current = onRequestClose
  onScaleRef.current = onScale

  const updateImageDimensions = useCallback(
    (width: number, height: number) => {
      const size = getContainSize(width, height, viewportWidth, viewportHeight)
      baseWidthSV.value = size.width
      baseHeightSV.value = size.height
    },
    [baseHeightSV, baseWidthSV, viewportHeight, viewportWidth],
  )

  const notifyScale = useCallback(
    (scale: number) => {
      onScaleRef.current?.({ index: activeIndex, scale })
    },
    [activeIndex],
  )

  useAnimatedReaction(
    () => scaleSV.value > 1 + EPSILON,
    (zoomed, previous) => {
      if (previous !== null && zoomed !== previous) scheduleOnRN(setIsZoomed, zoomed)
    },
    [scaleSV],
  )

  const reset = useCallback(() => {
    scaleSV.value = 1
    translateXSV.value = 0
    translateYSV.value = 0
    dismissTranslateYSV.value = 0
    setIsZoomed(false)
    setIsPinching(false)
    onScaleRef.current?.({ index: activeIndex, scale: 1 })
  }, [activeIndex, dismissTranslateYSV, scaleSV, translateXSV, translateYSV])

  const requestCloseFromGesture = useCallback(
    (reason: ImagePreviewCloseReason, fromRect?: ImagePreviewRect) => {
      onRequestCloseRef.current?.(reason, fromRect)
    },
    [],
  )

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(enabled)
        .onBegin((event) => {
          'worklet'
          pinchStartScaleSV.value = scaleSV.value
          pinchStartTranslateXSV.value = translateXSV.value
          pinchStartTranslateYSV.value = translateYSV.value
          pinchStartFocalXSV.value = event.focalX
          pinchStartFocalYSV.value = event.focalY
          pinchLastFocalXSV.value = event.focalX
          pinchLastFocalYSV.value = event.focalY
          scheduleOnRN(setIsPinching, true)
        })
        .onUpdate((event) => {
          'worklet'
          const nextScale = applyRubberBandScale(
            pinchStartScaleSV.value * event.scale,
            minZoom,
            maxZoom,
          )
          const acceptsFocal = shouldAcceptFocalPoint({
            currentFocalX: event.focalX,
            currentFocalY: event.focalY,
            previousFocalX: pinchLastFocalXSV.value,
            previousFocalY: pinchLastFocalYSV.value,
            width: viewportWidth,
            height: viewportHeight,
          })
          const focalX = acceptsFocal ? event.focalX : pinchLastFocalXSV.value
          const focalY = acceptsFocal ? event.focalY : pinchLastFocalYSV.value
          if (acceptsFocal) {
            pinchLastFocalXSV.value = event.focalX
            pinchLastFocalYSV.value = event.focalY
          }
          const translation = calculateFocalPointTranslation({
            currentFocalX: focalX,
            currentFocalY: focalY,
            startFocalX: pinchStartFocalXSV.value,
            startFocalY: pinchStartFocalYSV.value,
            initialScale: pinchStartScaleSV.value,
            nextScale,
            initialTranslateX: pinchStartTranslateXSV.value,
            initialTranslateY: pinchStartTranslateYSV.value,
            width: viewportWidth,
            height: viewportHeight,
          })
          scaleSV.value = nextScale
          translateXSV.value = clampTranslation(
            translation.x,
            getZoomBoundX(
              baseWidthSV.value,
              baseHeightSV.value,
              viewportWidth,
              viewportHeight,
              nextScale,
            ),
          )
          translateYSV.value = clampTranslation(
            translation.y,
            getZoomBoundY(
              baseWidthSV.value,
              baseHeightSV.value,
              viewportWidth,
              viewportHeight,
              nextScale,
            ),
          )
        })
        .onFinalize(() => {
          'worklet'
          const targetScale = Math.min(maxZoom, Math.max(1, scaleSV.value))
          const targetX =
            targetScale === 1
              ? 0
              : clampTranslation(
                  translateXSV.value,
                  getZoomBoundX(
                    baseWidthSV.value,
                    baseHeightSV.value,
                    viewportWidth,
                    viewportHeight,
                    targetScale,
                  ),
                )
          const targetY =
            targetScale === 1
              ? 0
              : clampTranslation(
                  translateYSV.value,
                  getZoomBoundY(
                    baseWidthSV.value,
                    baseHeightSV.value,
                    viewportWidth,
                    viewportHeight,
                    targetScale,
                  ),
                )
          scaleSV.value = withSpring(targetScale, SPRING_CONFIG)
          translateXSV.value = withSpring(targetX, SPRING_CONFIG)
          translateYSV.value = withSpring(targetY, SPRING_CONFIG)
          scheduleOnRN(setIsPinching, false)
          scheduleOnRN(notifyScale, targetScale)
        }),
    [
      baseHeightSV,
      baseWidthSV,
      enabled,
      maxZoom,
      minZoom,
      notifyScale,
      pinchLastFocalXSV,
      pinchLastFocalYSV,
      pinchStartFocalXSV,
      pinchStartFocalYSV,
      pinchStartScaleSV,
      pinchStartTranslateXSV,
      pinchStartTranslateYSV,
      scaleSV,
      translateXSV,
      translateYSV,
      viewportHeight,
      viewportWidth,
    ],
  )

  const zoomPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled && isZoomed)
        .maxPointers(1)
        .onBegin(() => {
          'worklet'
          panStartXSV.value = translateXSV.value
          panStartYSV.value = translateYSV.value
        })
        .onUpdate((event) => {
          'worklet'
          if (scaleSV.value <= 1 + EPSILON) return
          translateXSV.value = clampTranslation(
            panStartXSV.value + event.translationX,
            getZoomBoundX(
              baseWidthSV.value,
              baseHeightSV.value,
              viewportWidth,
              viewportHeight,
              scaleSV.value,
            ),
          )
          translateYSV.value = clampTranslation(
            panStartYSV.value + event.translationY,
            getZoomBoundY(
              baseWidthSV.value,
              baseHeightSV.value,
              viewportWidth,
              viewportHeight,
              scaleSV.value,
            ),
          )
        }),
    [
      baseHeightSV,
      baseWidthSV,
      enabled,
      isZoomed,
      panStartXSV,
      panStartYSV,
      scaleSV,
      translateXSV,
      translateYSV,
      viewportHeight,
      viewportWidth,
    ],
  )

  const doubleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(enabled)
        .numberOfTaps(2)
        .maxDelay(250)
        .onEnd((event, success) => {
          'worklet'
          if (!success) return
          const targetScale = scaleSV.value > 1 + EPSILON ? 1 : doubleTapZoom
          if (targetScale === 1) {
            scaleSV.value = withSpring(1, SPRING_CONFIG)
            translateXSV.value = withSpring(0, SPRING_CONFIG)
            translateYSV.value = withSpring(0, SPRING_CONFIG)
          } else {
            const translation = calculateFocalPointTranslation({
              currentFocalX: event.x,
              currentFocalY: event.y,
              startFocalX: event.x,
              startFocalY: event.y,
              initialScale: scaleSV.value,
              nextScale: targetScale,
              initialTranslateX: translateXSV.value,
              initialTranslateY: translateYSV.value,
              width: viewportWidth,
              height: viewportHeight,
            })
            scaleSV.value = withSpring(targetScale, SPRING_CONFIG)
            translateXSV.value = withSpring(
              clampTranslation(
                translation.x,
                getZoomBoundX(
                  baseWidthSV.value,
                  baseHeightSV.value,
                  viewportWidth,
                  viewportHeight,
                  targetScale,
                ),
              ),
              SPRING_CONFIG,
            )
            translateYSV.value = withSpring(
              clampTranslation(
                translation.y,
                getZoomBoundY(
                  baseWidthSV.value,
                  baseHeightSV.value,
                  viewportWidth,
                  viewportHeight,
                  targetScale,
                ),
              ),
              SPRING_CONFIG,
            )
          }
          scheduleOnRN(notifyScale, targetScale)
        }),
    [
      baseHeightSV,
      baseWidthSV,
      doubleTapZoom,
      enabled,
      notifyScale,
      scaleSV,
      translateXSV,
      translateYSV,
      viewportHeight,
      viewportWidth,
    ],
  )

  const singleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(enabled)
        .onEnd((event, success) => {
          'worklet'
          if (!success) return
          const imageWidth = baseWidthSV.value * scaleSV.value
          const imageHeight = baseHeightSV.value * scaleSV.value
          const imageLeft = (viewportWidth - imageWidth) / 2 + translateXSV.value
          const imageTop = (viewportHeight - imageHeight) / 2 + translateYSV.value
          const insideImage =
            event.x >= imageLeft &&
            event.x <= imageLeft + imageWidth &&
            event.y >= imageTop &&
            event.y <= imageTop + imageHeight
          const rect = {
            x: imageLeft,
            y: imageTop,
            width: imageWidth,
            height: imageHeight,
          }
          if (insideImage && closeOnPressImage) {
            scheduleOnRN(requestCloseFromGesture, 'image', rect)
          } else if (!insideImage && closeOnPressOverlay) {
            scheduleOnRN(requestCloseFromGesture, 'overlay')
          }
        }),
    [
      baseHeightSV,
      baseWidthSV,
      closeOnPressImage,
      closeOnPressOverlay,
      enabled,
      requestCloseFromGesture,
      scaleSV,
      translateXSV,
      translateYSV,
      viewportHeight,
      viewportWidth,
    ],
  )

  const tapGesture = useMemo(
    () => Gesture.Exclusive(doubleTapGesture, singleTapGesture),
    [doubleTapGesture, singleTapGesture],
  )
  const zoomGesture = useMemo(
    () => Gesture.Race(pinchGesture, Gesture.Exclusive(zoomPanGesture, tapGesture)),
    [pinchGesture, tapGesture, zoomPanGesture],
  )
  const dismissGesture = useMemo(
    () =>
      Gesture.Pan()
        .withRef(dismissGestureRef)
        .enabled(enabled && closeOnGesture && !isZoomed)
        .minDistance(10)
        .averageTouches(true)
        .activeOffsetY([-10, 10])
        .failOffsetX([-10, 10])
        .onUpdate((event) => {
          'worklet'
          dismissTranslateYSV.value = Math.max(0, event.translationY / DISMISS_RESISTANCE)
        })
        .onEnd((event, success) => {
          'worklet'
          const distance = Math.max(0, dismissTranslateYSV.value)
          if (
            success &&
            shouldDismiss({
              translationY: event.translationY,
              velocityY: event.velocityY,
              viewportHeight,
            })
          ) {
            const dismissScale = interpolateClamped(distance, 0, 300, 1, 0.88)
            scheduleOnRN(requestCloseFromGesture, 'gesture', {
              x:
                viewportWidth / 2 -
                (baseWidthSV.value * scaleSV.value * dismissScale) / 2 +
                translateXSV.value,
              y:
                viewportHeight / 2 -
                (baseHeightSV.value * scaleSV.value * dismissScale) / 2 +
                translateYSV.value +
                distance,
              width: baseWidthSV.value * scaleSV.value * dismissScale,
              height: baseHeightSV.value * scaleSV.value * dismissScale,
            })
            return
          }
          dismissTranslateYSV.value = withSpring(0, SPRING_CONFIG)
        }),
    [
      baseHeightSV,
      baseWidthSV,
      closeOnGesture,
      dismissGestureRef,
      dismissTranslateYSV,
      enabled,
      isZoomed,
      requestCloseFromGesture,
      scaleSV,
      translateXSV,
      translateYSV,
      viewportHeight,
      viewportWidth,
    ],
  )
  const gesture = useMemo(
    () => Gesture.Race(dismissGesture, zoomGesture),
    [dismissGesture, zoomGesture],
  )
  const nativeScrollGesture = useMemo(
    () => Gesture.Native().enabled(enabled).requireExternalGestureToFail(dismissGestureRef),
    [dismissGestureRef, enabled],
  )

  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.max(0, dismissTranslateYSV.value)
    const dismissScale = interpolateClamped(distance, 0, 300, 1, 0.88)
    return {
      transform: [
        { translateX: translateXSV.value },
        { translateY: translateYSV.value + distance },
        { scale: scaleSV.value * dismissScale },
      ],
    }
  }, [dismissTranslateYSV, scaleSV, translateXSV, translateYSV])

  return {
    animatedStyle,
    dismissTranslateY: dismissTranslateYSV as SharedValue<number>,
    gesture,
    isPinching,
    isZoomed,
    nativeScrollGesture,
    reset,
    updateImageDimensions,
  }
}
