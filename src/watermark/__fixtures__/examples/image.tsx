import { StyleSheet, View } from 'react-native'
import { Text, Watermark } from '../../..'

const watermarkImage = {
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
}

/**
 * @title Image watermark
 * @description Use an RN ImageSource as the repeated watermark content with contain resize mode.
 */
export default function WatermarkImageExample() {
  return (
    <Watermark
      image={watermarkImage}
      imageResizeMode="contain"
      style={styles.container}
      width={84}
      height={84}
    >
      <View style={styles.content}>
        <Text style={styles.title}>图片水印</Text>
        <Text type="secondary">图片优先于 content 渲染。</Text>
      </View>
    </Watermark>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minHeight: 180,
    padding: 24,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
})
