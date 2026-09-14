import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'
import type { ImageLoadEvent, ImageStyle, StyleProp, ViewStyle } from 'react-native'
import { Animated } from '../animation'
import { Text } from '../text'
import type { ImagePreviewImage, ImagePreviewRenderImageContext } from './types'
import type { NormalizedImage } from './utils'
import { normalizeImageSource } from './utils'

const LOADING_INDICATOR_DELAY = 140

export interface ImagePreviewItemProps {
  image: ImagePreviewImage
  normalized?: NormalizedImage
  index: number
  active?: boolean
  ready?: boolean
  initiallyReady?: boolean
  animatedStyle?: StyleProp<ViewStyle>
  renderImage?: (
    image: ImagePreviewImage,
    index: number,
    context: ImagePreviewRenderImageContext,
  ) => React.ReactNode
  onImageReady?: (index: number, dimensions?: { width: number; height: number }) => void
}

/** A virtualized page renderer. Viewer-level gesture state is intentionally not owned here. */
export const ImagePreviewItem = memo(function ImagePreviewItem({
  image,
  normalized: normalizedProp,
  index,
  active = false,
  ready = false,
  initiallyReady = ready,
  animatedStyle,
  renderImage,
  onImageReady,
}: ImagePreviewItemProps) {
  const normalized = useMemo(
    () => normalizedProp ?? normalizeImageSource(image),
    [image, normalizedProp],
  )
  const imageReady = ready || initiallyReady
  const imageReadyRef = useRef(imageReady)
  imageReadyRef.current = imageReady
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadErrorRef = useRef(false)
  const readyReportedRef = useRef(imageReady)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const onImageReadyRef = useRef(onImageReady)
  onImageReadyRef.current = onImageReady

  const clearLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current !== null) {
      clearTimeout(loadingTimerRef.current)
      loadingTimerRef.current = null
    }
  }, [])

  useEffect(() => clearLoadingTimer, [clearLoadingTimer])

  useEffect(() => {
    if (!imageReady) return
    clearLoadingTimer()
    setLoading(false)
    setLoadError(false)
  }, [clearLoadingTimer, imageReady])

  const handleLoadStart = useCallback(() => {
    clearLoadingTimer()
    setLoadError(false)
    loadErrorRef.current = false
    readyReportedRef.current = imageReadyRef.current
    if (imageReadyRef.current) {
      setLoading(false)
      return
    }
    loadingTimerRef.current = setTimeout(() => {
      loadingTimerRef.current = null
      if (!imageReadyRef.current) setLoading(true)
    }, LOADING_INDICATOR_DELAY)
  }, [clearLoadingTimer])

  const handleLoad = useCallback(
    (dimensions?: { width: number; height: number }) => {
      clearLoadingTimer()
      imageReadyRef.current = true
      loadErrorRef.current = false
      const hasDimensions = Boolean(dimensions && dimensions.width > 0 && dimensions.height > 0)
      if (hasDimensions || !readyReportedRef.current) {
        onImageReadyRef.current?.(index, hasDimensions ? dimensions : undefined)
        readyReportedRef.current = true
      }
      setLoading(false)
      setLoadError(false)
    },
    [clearLoadingTimer, index],
  )

  const handleLoadEnd = useCallback(() => {
    clearLoadingTimer()
    setLoading(false)
    if (!loadErrorRef.current && !readyReportedRef.current) {
      imageReadyRef.current = true
      onImageReadyRef.current?.(index)
      readyReportedRef.current = true
    }
  }, [clearLoadingTimer, index])

  const handleError = useCallback(() => {
    clearLoadingTimer()
    loadErrorRef.current = true
    setLoading(false)
    setLoadError(true)
  }, [clearLoadingTimer])

  const renderContext: ImagePreviewRenderImageContext = {
    source: normalized.source,
    style: StyleSheet.absoluteFill as ImageStyle,
    mode: 'preview',
    onLoadStart: handleLoadStart,
    onLoad: handleLoad,
    onLoadEnd: handleLoadEnd,
    onError: handleError,
  }
  const content = renderImage ? (
    renderImage(image, index, renderContext)
  ) : (
    <Image
      source={normalized.source}
      resizeMode="contain"
      onError={handleError}
      onLoad={(event: ImageLoadEvent) =>
        handleLoad({
          width: event.nativeEvent.source.width,
          height: event.nativeEvent.source.height,
        })
      }
      onLoadEnd={handleLoadEnd}
      onLoadStart={handleLoadStart}
      style={StyleSheet.absoluteFill as ImageStyle}
      testID={`image-preview-native-image-${index}`}
    />
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
      {loading && !imageReady ? (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator testID="image-preview-loading" />
        </View>
      ) : null}
      {loadError ? (
        <View pointerEvents="none" style={styles.loading}>
          <Text>图片加载失败</Text>
        </View>
      ) : null}
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
