import { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ImagePreview } from '../../..'
import { NETWORK_PHOTOS } from './network-photo-data'
import PreviewToolbar from './preview-toolbar'

const PHOTOS = NETWORK_PHOTOS.slice(0, 12).map((photo) => ({ ...photo, id: `gallery-${photo.id}` }))
type Photo = (typeof NETWORK_PHOTOS)[number]
type Status = 'loading' | 'loaded' | 'error'

function NetworkPhoto({
  photo,
  index,
  onOpen,
}: {
  photo: Photo
  index: number
  onOpen: () => void
}) {
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string>()
  const [attempt, setAttempt] = useState(0)

  const retry = () => {
    setError(undefined)
    setStatus('loading')
    setAttempt((current) => current + 1)
  }

  return (
    <View style={styles.card}>
      <ImagePreview.Source
        imageId={photo.id}
        style={[styles.thumbnail, { width: (120 * photo.width) / photo.height }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`打开第 ${index + 1} 张网络图片预览`}
          style={styles.image}
          onPress={onOpen}
        >
          <Image
            key={attempt}
            source={photo.thumbnail}
            resizeMode="contain"
            style={styles.image}
            onLoadStart={() => setStatus('loading')}
            onLoad={() => {
              setError(undefined)
              setStatus('loaded')
            }}
            onError={({ nativeEvent }) => {
              setError(nativeEvent.error)
              setStatus('error')
            }}
          />
        </Pressable>
      </ImagePreview.Source>
      <Text style={styles.caption}>
        第 {index + 1} 张 · {photo.id}
      </Text>
      <Text style={styles.caption}>
        {photo.width} × {photo.height}
      </Text>
      {status === 'loading' ? <Text style={styles.caption}>图片加载中…</Text> : null}
      {status === 'error' ? (
        <View style={styles.failure}>
          <Text style={styles.error} numberOfLines={3}>
            图片加载失败：{error || '请检查网络连接'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`重新加载第 ${index + 1} 张网络图片`}
            onPress={retry}
            style={styles.retry}
          >
            <Text style={styles.retryLabel}>重新加载</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

/** @title 网络图片分组 @description 12 张不同的网络图片按完整比例展示，同组预览支持分页；显示加载状态，失败后可重新加载。 */
export default function ImagePreviewNetworkImages() {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(PHOTOS[0].id)

  return (
    <View style={styles.example}>
      <Text>12 张不同的网络图片。横向滚动选择图片，打开后可左右切换、缩放和下拉关闭。</Text>
      <Text>消息只加载缩略图，预览按需加载清晰图片；使用和聊天示例相同的缩放、关闭和工具栏。</Text>
      <ScrollView horizontal contentContainerStyle={styles.photos}>
        {PHOTOS.map((photo, index) => (
          <NetworkPhoto
            key={photo.id}
            photo={photo}
            index={index}
            onOpen={() => {
              setActiveId(photo.id)
              setVisible(true)
            }}
          />
        ))}
      </ScrollView>
      <ImagePreview
        visible={visible}
        items={PHOTOS}
        activeId={activeId}
        closeable
        renderToolbar={(params) => <PreviewToolbar {...params} />}
        onChange={({ id }) => setActiveId(id)}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  example: { gap: 12 },
  photos: { gap: 12, paddingBottom: 12 },
  card: { gap: 6, alignItems: 'flex-start' },
  thumbnail: { height: 120, backgroundColor: '#202020' },
  image: { width: '100%', height: '100%' },
  caption: { color: '#666666', fontSize: 12 },
  failure: { width: 180, gap: 6 },
  error: { color: '#c62828', fontSize: 12 },
  retry: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#eeeeee', borderRadius: 6 },
  retryLabel: { color: '#333333', fontSize: 12 },
})
