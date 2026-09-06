import { Watermark } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 文字水印
 * @description 使用 content 添加文字水印，水印会自动在父容器内平铺。
 */
export default function WatermarkBasicExample() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>订单详情</Text>
      <Text style={styles.body}>这是一段需要保护的业务内容，水印不会阻止内容交互。</Text>
      <Watermark content="React Native UI" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    gap: 10,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  title: { color: '#1f2329', fontSize: 18, fontWeight: '600' },
  body: { color: '#68788d', fontSize: 14, lineHeight: 22 },
})
