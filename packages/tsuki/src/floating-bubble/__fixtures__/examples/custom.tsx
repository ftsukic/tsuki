import { StyleSheet, View } from 'react-native'
import { FloatingBubble, Text } from '@ftsukic/tsuki'

/**
 * @title 自定义内容
 * @description children 可以是文字等任意 ReactNode，自定义尺寸也会以真实 layout 参与边界计算。
 */
export default function FloatingBubbleCustomExample() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>自定义 64px 气泡</Text>
      <Text style={styles.description}>组件不绑定 Vant icon name，children 完全由调用方决定。</Text>
      <FloatingBubble
        axis="xy"
        style={styles.largeBubble}
        defaultOffset={{ x: 140, y: 180 }}
        accessibilityLabel="自定义内容气泡"
      >
        <Text style={styles.bubbleText}>客服</Text>
      </FloatingBubble>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 440, gap: 12, backgroundColor: '#f7f8fa', padding: 20 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  largeBubble: { width: 64, height: 64, borderRadius: 32 },
  bubbleText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
})
