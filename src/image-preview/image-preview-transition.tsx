import { useCallback, useMemo, useRef } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import type { ImageLoadEvent } from 'react-native'
import { Animated } from '../animation'
import { useAnimatedStyle } from '../animation'
import type { SharedValue } from 'react-native-reanimated'
import type {
  ImagePreviewImage,
  ImagePreviewProps,
  ImagePreviewRect,
  ImagePreviewRenderImageContext,
} from './types'
import type { NormalizedImage } from './utils'
import { interpolateRect, normalizeImageSource } from './utils'

export interface ImagePreviewTransitionProps {
  image: ImagePreviewImage
  normalized?: NormalizedImage
  fromRect: ImagePreviewRect
  toRect: ImagePreviewRect
  progress: SharedValue<number>
  index: number
  renderImage?: ImagePreviewProps['renderImage']
  onImageReady?: (index: number, dimensions?: { width: number; height: number }) => void
}

/** Renders a single image between two window-coordinate rectangles. */
export function ImagePreviewTransition({
  image,
  normalized: normalizedProp,
  fromRect,
  toRect,
  progress,
  index,
  renderImage,
  onImageReady,
}: ImagePreviewTransitionProps) {
  const normalized = useMemo(
    () => normalizedProp ?? normalizeImageSource(image),
    [image, normalizedProp],
  )

  const imageStyle = useAnimatedStyle(() => {
    const rect = interpolateRect(fromRect, toRect, progress.value)
    return {
      height: rect.height,
      left: rect.x,
      position: 'absolute' as const,
      top: rect.y,
      width: rect.width,
    }
  }, [fromRect, progress, toRect])

  const loadErrorRef = useRef(false)
  const readyReportedRef = useRef(false)
  const handleLoadStart = useCallback(() => {
    loadErrorRef.current = false
    readyReportedRef.current = false
  }, [])
  const handleLoad = useCallback(
    (dimensions?: { width: number; height: number }) => {
      loadErrorRef.current = false
      const hasDimensions = Boolean(dimensions && dimensions.width > 0 && dimensions.height > 0)
      if (hasDimensions || !readyReportedRef.current) {
        onImageReady?.(index, hasDimensions ? dimensions : undefined)
        readyReportedRef.current = true
      }
    },
    [index, onImageReady],
  )
  const handleLoadEnd = useCallback(() => {
    if (!loadErrorRef.current && !readyReportedRef.current) {
      onImageReady?.(index)
      readyReportedRef.current = true
    }
  }, [index, onImageReady])
  const handleError = useCallback(() => {
    loadErrorRef.current = true
  }, [])
  const renderContext: ImagePreviewRenderImageContext = {
    source: normalized.source,
    style: { flex: 1 },
    mode: 'transition',
    onLoadStart: handleLoadStart,
    onLoad: handleLoad,
    onLoadEnd: handleLoadEnd,
    onError: handleError,
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="image-preview-transition">
      <Animated.View style={imageStyle}>
        {renderImage ? (
          renderImage(image, index, renderContext)
        ) : (
          <Image
            source={normalized.source}
            style={{ flex: 1 }}
            resizeMode="contain"
            onLoadStart={handleLoadStart}
            onLoad={(event: ImageLoadEvent) =>
              handleLoad({
                width: event.nativeEvent.source.width,
                height: event.nativeEvent.source.height,
              })
            }
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            testID={`image-preview-transition-native-image-${index}`}
          />
        )}
      </Animated.View>
    </View>
  )
}

ImagePreviewTransition.displayName = 'ImagePreview.Transition'
