import { StyleSheet, View } from 'react-native'
import { Text, Watermark } from '../../..'

/**
 * @title Semantic styles
 * @description Customize the root, individual mark, and watermark text through semantic slots.
 */
export default function WatermarkCustomExample() {
  return (
    <Watermark
      content="CUSTOM"
      style={styles.container}
      styles={{
        mark: styles.mark,
        root: styles.root,
        text: styles.text,
      }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>语义样式</Text>
        <Text type="secondary">styles 不改变水印的平铺坐标。</Text>
      </View>
    </Watermark>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 180,
    padding: 24,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#f4f0ff',
    borderRadius: 12,
    gap: 8,
    justifyContent: 'center',
    minHeight: 132,
    padding: 20,
  },
  mark: {
    borderColor: '#7232dd',
    borderRadius: 12,
    borderWidth: 1,
  },
  root: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  text: {
    color: '#7232dd',
    fontWeight: '600',
  },
  title: {
    fontWeight: '600',
  },
})
