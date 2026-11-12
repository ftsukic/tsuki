import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import type { ImageSourcePropType } from 'react-native'
import { Pressable } from '../pressable'
import { Text } from '../text'
import { defaultImagePreviewAdapter, getImagePreviewSourceKey } from './image-adapter'
import type {
  ImagePreviewImage,
  ImagePreviewImageAdapter,
  ImagePreviewLoadState,
  ImagePreviewProps,
} from './types'

export interface ImagePreviewItemProps {
  item: ImagePreviewImage
  imageAdapter?: ImagePreviewImageAdapter
  renderMedia?: ImagePreviewProps['renderMedia']
  active?: boolean
  playing?: boolean
  originalRequested?: boolean
  originalAttempt?: number
  onDisplayStateChange?: (id: string, state: ImagePreviewLoadState) => void
  onOriginalStateChange?: (id: string, state: ImagePreviewLoadState) => void
}

interface SourceLayerProps {
  source: ImageSourcePropType
  adapter: ImagePreviewImageAdapter
  testID: string
  original?: boolean
  showStatus?: boolean
  onStateChange?: (state: ImagePreviewLoadState) => void
}

/** Loading belongs to this mounted request, never to a URI that loaded in an older page. */
function SourceLayer({
  source,
  adapter,
  testID,
  original = false,
  showStatus = true,
  onStateChange,
}: SourceLayerProps) {
  const [state, setState] = useState<ImagePreviewLoadState>('loading')
  const [attempt, setAttempt] = useState(0)
  const mountedRef = useRef(true)
  const attemptRef = useRef(attempt)
  attemptRef.current = attempt
  const callbackRef = useRef(onStateChange)
  callbackRef.current = onStateChange

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    callbackRef.current?.(state)
  }, [state])

  const updateState = useCallback(
    (next: ImagePreviewLoadState) => {
      if (mountedRef.current && attemptRef.current === attempt) setState(next)
    },
    [attempt],
  )
  const handleRetry = useCallback(() => {
    setState('loading')
    attemptRef.current += 1
    setAttempt(attemptRef.current)
  }, [])

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {/* Let native previews draw without waiting for the onLoad round trip to RN. */}
      <View
        key={attempt}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, original && state !== 'loaded' && styles.hidden]}
      >
        {adapter.render({
          source,
          style: styles.image,
          onLoadStart: () => updateState('loading'),
          onLoad: () => updateState('loaded'),
          onError: () => updateState('error'),
          testID,
        })}
      </View>
      {showStatus && state === 'loading' ? (
        <View pointerEvents="none" style={styles.status}>
          <ActivityIndicator color="#ffffff" testID={`${testID}-loading`} />
          {original ? <Text style={styles.statusLabel}>正在加载原图</Text> : null}
        </View>
      ) : null}
      {showStatus && state === 'error' ? (
        <View pointerEvents="box-none" style={styles.status}>
          <Pressable
            accessibilityLabel={original ? '原图加载失败，重试' : '图片加载失败，重试'}
            accessibilityRole="button"
            onPress={handleRetry}
            style={styles.retry}
            testID={`${testID}-retry`}
          >
            <Text style={styles.statusLabel}>
              {original ? '原图加载失败，点击重试' : '图片加载失败，点击重试'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

function VersionedSourceLayer(props: SourceLayerProps & { attempt?: number }) {
  const { source, adapter, attempt = 0, ...layerProps } = props
  const sourceKey = getImagePreviewSourceKey(source)
  const versionRef = useRef({ sourceKey, adapter, attempt, key: 0 })
  const previous = versionRef.current
  if (
    previous.sourceKey !== sourceKey ||
    previous.adapter !== adapter ||
    previous.attempt !== attempt
  ) {
    versionRef.current = { sourceKey, adapter, attempt, key: previous.key + 1 }
  }
  return (
    <SourceLayer key={versionRef.current.key} source={source} adapter={adapter} {...layerProps} />
  )
}

/** Geometry and gestures stay on the page, so loading never gates an open or close animation. */
export const ImagePreviewItem = memo(function ImagePreviewItem({
  item,
  imageAdapter = defaultImagePreviewAdapter,
  renderMedia,
  active = false,
  playing = false,
  originalRequested = false,
  originalAttempt = 0,
  onOriginalStateChange,
  onDisplayStateChange,
}: ImagePreviewItemProps) {
  const originalCallback = useCallback(
    (state: ImagePreviewLoadState) => onOriginalStateChange?.(item.id, state),
    [item.id, onOriginalStateChange],
  )
  const displayCallback = useCallback(
    (state: ImagePreviewLoadState) => onDisplayStateChange?.(item.id, state),
    [item.id, onDisplayStateChange],
  )
  const originalVisible = Boolean(originalRequested && item.original)
  useEffect(() => {
    if (!originalVisible) originalCallback('idle')
  }, [originalCallback, originalVisible])

  return (
    <View
      key={item.id}
      collapsable={false}
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      testID={`image-preview-item-${item.id}`}
    >
      {item.thumbnail ? (
        <VersionedSourceLayer
          adapter={imageAdapter}
          showStatus={false}
          onStateChange={displayCallback}
          source={item.thumbnail}
          testID={`image-preview-thumbnail-${item.id}`}
        />
      ) : null}
      {item.type === 'video' ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {renderMedia?.({
            item,
            active,
            playing,
            style: styles.image,
            onLoad: () => displayCallback('loaded'),
            onError: () => displayCallback('error'),
          })}
        </View>
      ) : (
        <VersionedSourceLayer
          adapter={imageAdapter}
          onStateChange={displayCallback}
          source={item.source}
          testID={`image-preview-image-${item.id}`}
        />
      )}
      {originalVisible && item.original ? (
        <VersionedSourceLayer
          adapter={imageAdapter}
          attempt={originalAttempt}
          onStateChange={originalCallback}
          original
          source={item.original}
          testID={`image-preview-original-${item.id}`}
        />
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
  },
  hidden: { opacity: 0 },
  status: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusLabel: { color: '#ffffff', textAlign: 'center' },
  retry: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
})

ImagePreviewItem.displayName = 'ImagePreview.Item'
