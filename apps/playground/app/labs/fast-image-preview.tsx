import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import FastImage from 'react-native-fast-image'
import { ImagePreview, Text, useToken } from '@ftsukic/tsuki'
import { fastImageAdapter } from '../../components/fast-image-adapter'

const ITEMS = [
  { id: 'landscape', width: 1200, height: 800, photo: 10 },
  { id: 'portrait', width: 800, height: 1200, photo: 64 },
  { id: 'square', width: 1000, height: 1000, photo: 15 },
].map(({ photo, ...item }) => ({
  ...item,
  source: { uri: `https://picsum.photos/id/${photo}/${item.width}/${item.height}.jpg` },
  thumbnail: { uri: `https://picsum.photos/id/${photo}/240/240.jpg` },
}))

/** Example-only integration: the library depends only on the imageAdapter contract. */
export default function FastImagePreviewScreen() {
  const { token } = useToken()
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  return (
    <ImagePreview.Provider>
      <Stack.Screen options={{ title: 'FastImage 图片预览' }} />
      <ScrollView
        style={{ backgroundColor: token.colorBgLayout }}
        contentContainerStyle={styles.content}
      >
        <Text>FastImage 缩略图与图片预览</Text>
        <Text>点击缩略图，体验缩放、切图、拖动关闭和回到当前来源。邻页由 FastImage 预加载。</Text>
        <View style={styles.thumbnails}>
          {ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`打开第 ${index + 1} 张 FastImage 图片`}
              onPress={() => {
                setActiveId(item.id)
                setVisible(true)
              }}
            >
              <ImagePreview.Source imageId={item.id}>
                <FastImage
                  source={item.thumbnail}
                  objectFit="cover"
                  transition={false}
                  accessible={false}
                  style={styles.thumbnail}
                />
              </ImagePreview.Source>
            </Pressable>
          ))}
        </View>
        <Text>
          当前图片：{ITEMS.findIndex((item) => item.id === activeId) + 1} / {ITEMS.length}
        </Text>
      </ScrollView>
      <ImagePreview
        visible={visible}
        items={ITEMS}
        activeId={activeId}
        imageAdapter={fastImageAdapter}
        closeable
        onChange={({ id }) => setActiveId(id)}
        onRequestClose={() => setVisible(false)}
      />
    </ImagePreview.Provider>
  )
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  thumbnails: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  thumbnail: { width: 96, height: 96, borderRadius: 12 },
})
