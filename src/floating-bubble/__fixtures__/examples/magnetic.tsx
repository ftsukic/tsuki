import { StyleSheet, View } from 'react-native'
import { FloatingBubble, Text } from '@ftsukic/tsuki'
import { useState } from 'react'

/**
 * @title 横向磁吸
 * @description magnetic="x" 保持 y 坐标不变，松手后将气泡吸附到最近的左右边界。
 */
export default function FloatingBubbleMagneticExample() {
  const [completed, setCompleted] = useState(0)
  return (
    <View style={styles.page}>
      <Text style={styles.title}>左右磁吸</Text>
      <Text style={styles.description}>
        松手后快速吸附并轻微回弹；吸附途中可以再次拖动。完成次数：{completed}
      </Text>
      <FloatingBubble
        axis="xy"
        magnetic="x"
        defaultOffset={{ x: 140, y: 180 }}
        accessibilityLabel="可磁吸的浮动气泡"
        onOffsetChangeEnd={() => setCompleted((value) => value + 1)}
      >
        <Text style={styles.bubbleText}>吸</Text>
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
