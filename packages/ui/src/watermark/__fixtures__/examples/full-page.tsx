import { Watermark } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 全屏范围
 * @description fullPage 使用父容器的 absoluteFill 布局；将组件放在屏幕根容器即可覆盖整个屏幕。
 */
export default function WatermarkFullPageExample() {
  return (
    <View style={styles.screen}>
      <Text style={styles.body}>fullPage 适合放在页面根容器中使用。</Text>
      <Watermark content="页面水印" fullPage opacity={0.55} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 160,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    backgroundColor: '#f7f8fa',
    borderRadius: 8,
  },
  body: { color: '#68788d', fontSize: 14, lineHeight: 22 },
})
