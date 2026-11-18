import { StyleSheet, View } from 'react-native'
import { FloatingBubble, Text } from '@ftsukic/tsuki'

/**
 * @title 安全区
 * @description safeAreaInsetTop 和 safeAreaInsetBottom 默认开启，拖动边界会避开系统安全区。
 */
export default function FloatingBubbleSafeAreaExample() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>安全区边界</Text>
      <Text style={styles.description}>
        默认避开刘海、状态栏和 Home Indicator；需要时可分别传 false 关闭。
      </Text>
      <FloatingBubble
        axis="xy"
        safeAreaInsetTop
        safeAreaInsetBottom
        accessibilityLabel="安全区浮动气泡"
      >
        <Text style={styles.bubbleText}>安</Text>
      </FloatingBubble>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 420, gap: 12, backgroundColor: '#f7f8fa', padding: 20 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  bubbleText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
})
