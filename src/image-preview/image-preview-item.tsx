import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import type { ImageLoadEvent, ImageStyle, StyleProp, ViewStyle } from 'react-native'
import { Animated } from '../animation'
import type { ImagePreviewImage } from './interface'
import type { NormalizedImage } from './utils'
import { normalizeImageSource } from './utils'

export interface ImagePreviewItemProps {
  image: ImagePreviewImage
  normalized?: NormalizedImage
  index: number
  active?: boolean
  animatedStyle?: StyleProp<ViewStyle>
  renderImage?: (image: ImagePreviewImage, index: number) => React.ReactNode
  onImageReady?: (index: number, dimensions?: { width: number; height: number }) => void
}

/** A virtualized page renderer. Viewer-level gesture state is intentionally not owned here. */
export const ImagePreviewItem = memo(function ImagePreviewItem({
  image,
  normalized: normalizedProp,
  index,
  active = false,
  animatedStyle,
  renderImage,
  onImageReady,
}: ImagePreviewItemProps) {
  const normalized = useMemo(
    () => normalizedProp ?? normalizeImageSource(image),
    [image, normalizedProp],
  )
  const [loading, setLoading] = useState(!renderImage)
  const [loadError, setLoadError] = useState(false)
  const onImageReadyRef = useRef(onImageReady)
  onImageReadyRef.current = onImageReady

  const handleLoadStart = useCallback(() => {
    setLoading(true)
    setLoadError(false)
  }, [])

  const handleLoad = useCallback(
    (event: ImageLoadEvent) => {
      const source = event.nativeEvent.source
      if (source.width > 0 && source.height > 0) {
        onImageReadyRef.current?.(index, { width: source.width, height: source.height })
      }
      setLoading(false)
      setLoadError(false)
    },
    [index],
  )

  const handleLoadEnd = useCallback(() => {
    setLoading(false)
    onImageReadyRef.current?.(index)
  }, [index])

  const handleError = useCallback(() => {
    setLoading(false)
    setLoadError(true)
  }, [])

  const content = renderImage ? (
    renderImage(image, index)
  ) : (
    <>
      <Image
        source={normalized.source}
        resizeMode="contain"
        onError={handleError}
        onLoad={handleLoad}
        onLoadEnd={handleLoadEnd}
        onLoadStart={handleLoadStart}
        style={StyleSheet.absoluteFill as ImageStyle}
      />
      {loading ? (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : null}
      {loadError ? (
        <View pointerEvents="none" style={styles.loading}>
          <Text>图片加载失败</Text>
        </View>
      ) : null}
    </>
  )

  return (
    <Animated.View
      accessible={active}
      accessibilityLabel={`Image ${index + 1}`}
      collapsable={false}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, animatedStyle]}
      testID={`image-preview-item-${index}`}
    >
      {content}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

ImagePreviewItem.displayName = 'ImagePreview.Item'
