import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FloatingBubble, Text } from '@ftsukic/tsuki'

/**
 * @title 受控位置
 * @description offset 与 onOffsetChange 让父组件持有气泡的最终位置。
 */
export default function FloatingBubbleControlledExample() {
  const [offset, setOffset] = useState({ x: 140, y: 180 })

  return (
    <View style={styles.page}>
      <Text style={styles.title}>受控 offset</Text>
      <Text style={styles.description}>
        当前坐标：x={Math.round(offset.x)}，y={Math.round(offset.y)}
      </Text>
      <FloatingBubble
        axis="xy"
        offset={offset}
        onOffsetChange={setOffset}
        accessibilityLabel="受控浮动气泡"
      >
        <Text style={styles.bubbleText}>控</Text>
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
