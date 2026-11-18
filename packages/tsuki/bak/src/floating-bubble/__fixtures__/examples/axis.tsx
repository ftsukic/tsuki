import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FloatingBubble, Text } from '@ftsukic/tsuki'

/**
 * @title 拖动方向
 * @description x 只允许横向、y 只允许纵向、xy 允许自由拖动，lock 完全禁止拖动但仍可点击。
 */
export default function FloatingBubbleAxisExample() {
  const [message, setMessage] = useState('尝试拖动四个气泡')
  const bubbles = [
    { axis: 'x' as const, label: 'X', offset: { x: 24, y: 120 } },
    { axis: 'y' as const, label: 'Y', offset: { x: 96, y: 120 } },
    { axis: 'xy' as const, label: 'XY', offset: { x: 168, y: 120 } },
    { axis: 'lock' as const, label: '锁', offset: { x: 252, y: 120 } },
  ]

  return (
    <View style={styles.page}>
      <Text style={styles.title}>四种拖动模式</Text>
      <Text style={styles.description}>{message}</Text>
      {bubbles.map(({ axis, label, offset }) => (
        <FloatingBubble
          key={axis}
          axis={axis}
          defaultOffset={offset}
          accessibilityLabel={`${label} 方向气泡`}
          onPress={() => setMessage(`${label} 气泡已点击`)}
        >
          <Text style={styles.bubbleText}>{label}</Text>
        </FloatingBubble>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 420, gap: 12, backgroundColor: '#f7f8fa', padding: 20 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  bubbleText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
})
