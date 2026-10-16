import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { ImagePreview } from '../../..'
import { createLocalPhotos } from './local-photo-data'
import PreviewToolbar from './preview-toolbar'

const ITEMS = createLocalPhotos('local-basic')

/** @title 长图与横图 @description 图片序列与来源位置分离；长图、横图使用相同的预览器和工具栏。 */
export default function ImagePreviewBasic() {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  return (
    <View style={styles.example}>
      <View style={styles.row}>
        {ITEMS.map((item, index) => (
          <ImagePreview.Source
            key={item.id}
            imageId={item.id}
            style={[styles.thumbnail, { width: (160 * item.width) / item.height }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`打开第 ${index + 1} 张图片预览`}
              style={styles.image}
              onPress={() => {
                setActiveId(item.id)
                setVisible(true)
              }}
            >
              <Image
                source={item.source}
                resizeMode="contain"
                style={styles.image}
                onLoad={() => setErrors((current) => ({ ...current, [item.id]: false }))}
                onError={() => setErrors((current) => ({ ...current, [item.id]: true }))}
              />
            </Pressable>
          </ImagePreview.Source>
        ))}
      </View>
      {Object.values(errors).some(Boolean) ? <Text>本地图片加载失败，请重新打开示例。</Text> : null}
      <ImagePreview
        visible={visible}
        items={ITEMS}
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
  row: { flexDirection: 'row', gap: 8 },
  thumbnail: { height: 160, backgroundColor: '#202020' },
  image: { height: '100%', width: '100%' },
})
