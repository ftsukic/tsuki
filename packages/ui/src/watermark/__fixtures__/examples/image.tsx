import { Watermark } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 图片水印
 * @description image 支持远程 URL、require(...) 和 RN ImageSource；同时传入 content 时优先展示图片。
 */
export default function WatermarkImageExample() {
  return (
    <View style={styles.card}>
      <Text style={styles.body}>图片水印可用于展示品牌标识或业务图案。</Text>
      <Watermark
        image="https://fastly.jsdelivr.net/npm/@vant/assets/vant-watermark.png"
        content="备用文字"
        opacity={0.2}
      />
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
