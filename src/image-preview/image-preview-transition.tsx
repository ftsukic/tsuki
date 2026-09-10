import { useEffect, useMemo } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import type { ImageLoadEvent } from 'react-native'
import type { ReactNode } from 'react'
import { useAnimatedStyle, useSharedValue, withTiming } from '../animation'
import { Animated } from '../animation'
import { scheduleOnRN } from 'react-native-worklets'
import type { ImagePreviewImage, ImagePreviewRect } from './interface'
import type { NormalizedImage } from './utils'
import { interpolateRect, normalizeImageSource } from './utils'

export interface ImagePreviewTransitionProps {
  image: ImagePreviewImage
  normalized?: NormalizedImage
  fromRect: ImagePreviewRect
  toRect: ImagePreviewRect
  duration: number
  visible?: boolean
  renderImage?: (image: ImagePreviewImage) => ReactNode
  onComplete?: () => void
  onLoad?: (event: ImageLoadEvent) => void
  onLoadEnd?: () => void
}

/** Animates a single image between two window-coordinate rectangles. */
export function ImagePreviewTransition({
  image,
  normalized: normalizedProp,
  fromRect,
  toRect,
  duration,
  visible = true,
  renderImage,
  onComplete,
  onLoad,
  onLoadEnd,
}: ImagePreviewTransitionProps) {
  const progressSV = useSharedValue(0)
  const normalized = useMemo(
    () => normalizedProp ?? normalizeImageSource(image),
    [image, normalizedProp],
  )

  useEffect(() => {
    if (!visible) return
    progressSV.value = 0
    progressSV.value = withTiming(1, { duration: Math.max(0, duration) }, (finished) => {
      'worklet'
      if (finished && onComplete) scheduleOnRN(onComplete)
    })
  }, [duration, onComplete, progressSV, visible])

  const imageStyle = useAnimatedStyle(() => {
    const rect = interpolateRect(fromRect, toRect, progressSV.value)
    return {
      height: rect.height,
      left: rect.x,
      position: 'absolute' as const,
      top: rect.y,
      width: rect.width,
    }
  }, [fromRect, progressSV, toRect])

  if (!visible) return null

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="image-preview-transition">
      <Animated.View style={imageStyle}>
        {renderImage ? (
          renderImage(image)
        ) : (
          <Image
            source={normalized.source}
            style={{ flex: 1 }}
            resizeMode="contain"
            onLoad={onLoad}
            onLoadEnd={onLoadEnd}
          />
        )}
      </Animated.View>
    </View>
  )
}

ImagePreviewTransition.displayName = 'ImagePreview.Transition'
