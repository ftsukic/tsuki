import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { ImagePreview } from '../../..'
import type { ImagePreviewImageAdapter } from '../../..'
import PreviewToolbar from './preview-toolbar'

const ORIGINAL = 'https://oss-im.vie.com.cn/image/20260831/0aa0c3e8c2b54630a291a59e1231417e.png'
const THUMBNAIL = `${ORIGINAL}?x-oss-process=image%2Fresize%2Cw_600`
const ITEMS = [
  {
    id: 'oss-photo',
    width: 1320,
    height: 2868,
    thumbnail: { uri: THUMBNAIL },
    source: { uri: THUMBNAIL },
    original: { uri: ORIGINAL },
  },
]

/** @title OSS 在线图片与原图 @description 预览先显示 OSS 600px 图片，通过统一工具栏加载原图；失败保留已加载图片并可重试。 */
export default function ImagePreviewOnlineImage({
  imageAdapter,
}: { imageAdapter?: ImagePreviewImageAdapter } = {}) {
  const [visible, setVisible] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  return (
    <View style={styles.example}>
      <Text>OSS 在线图片：预览先显示 600px 图片，点击底部“查看原图”加载完整图片。</Text>
      <ImagePreview.Source imageId={ITEMS[0].id} style={styles.thumbnail}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="打开 OSS 在线图片"
          style={styles.image}
          onPress={() => setVisible(true)}
        >
          {imageAdapter ? (
            <View key={attempt} style={styles.image}>
              {imageAdapter.render({
                source: ITEMS[0].thumbnail,
                style: styles.image,
                onLoadStart: () => setThumbnailError(false),
                onLoad: () => setThumbnailError(false),
                onError: () => setThumbnailError(true),
              })}
            </View>
          ) : (
            <Image
              key={attempt}
              source={ITEMS[0].thumbnail}
              resizeMode="contain"
              style={styles.image}
              onError={() => setThumbnailError(true)}
              onLoad={() => setThumbnailError(false)}
            />
          )}
        </Pressable>
      </ImagePreview.Source>
      {thumbnailError ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setThumbnailError(false)
            setAttempt((current) => current + 1)
          }}
        >
          <Text style={styles.error}>缩略图加载失败，点击重试；也可以打开预览。</Text>
        </Pressable>
      ) : null}
      <ImagePreview
        visible={visible}
        items={ITEMS}
        imageAdapter={imageAdapter}
        activeId={ITEMS[0].id}
        closeable
        renderToolbar={(params) => <PreviewToolbar {...params} />}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  example: { gap: 12 },
  thumbnail: { width: 120, height: (120 * 2868) / 1320, backgroundColor: '#202020' },
  image: { width: '100%', height: '100%' },
  error: { color: '#c62828', fontSize: 12 },
})
