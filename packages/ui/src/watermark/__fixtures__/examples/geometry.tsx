import { Watermark } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 间距与旋转
 * @description width、height 定义单个水印单元，gapX、gapY 控制单元之间的空白，rotate 控制倾斜角度。
 */
export default function WatermarkGeometryExample() {
  return (
    <View style={styles.card}>
      <Text style={styles.body}>自定义水印单元和重复间距。</Text>
      <Watermark content="内部资料" width={132} height={72} gapX={24} gapY={16} rotate={-12} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  body: { color: '#68788d', fontSize: 14, lineHeight: 22 },
})
