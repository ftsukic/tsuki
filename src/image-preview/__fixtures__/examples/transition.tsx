import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { ImagePreview } from '../..'
import { NETWORK_PHOTOS } from '../../../image-preview/__fixtures__/examples/network-photo-data'
import PreviewToolbar from '../../../image-preview/__fixtures__/examples/preview-toolbar'

const ITEMS = NETWORK_PHOTOS.slice(8, 11).map((item) => ({ ...item, id: `transition-${item.id}` }))

/** @title 缩略图过渡 @description 来源包装器仅登记位置，完整图片序列由 ImagePreview 管理。 */
export default function Transition() {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  return (
    <View>
      <View style={styles.row}>
        {ITEMS.map((item, index) => (
          <View key={item.id} style={styles.card}>
            <ImagePreview.Source imageId={item.id} style={styles.thumbnail}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`打开第 ${index + 1} 张图片`}
                style={styles.image}
                onPress={() => {
                  setActiveId(item.id)
                  setVisible(true)
                }}
              >
                <Image source={item.thumbnail} resizeMode="cover" style={styles.image} />
              </Pressable>
            </ImagePreview.Source>
            <Text style={styles.label}>{`第 ${index + 1} 张`}</Text>
          </View>
        ))}
      </View>
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
  row: { flexDirection: 'row', gap: 8 },
  card: { gap: 4 },
  label: { textAlign: 'center' },
  thumbnail: { height: 96, width: 96, backgroundColor: '#202020' },
  image: { width: '100%', height: '100%' },
})
