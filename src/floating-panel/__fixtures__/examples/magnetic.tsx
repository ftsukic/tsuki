import React from 'react'

import { FloatingPanel } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 关闭磁吸
 * @description magnetic=false 时，面板松手后停留在边界内的实际高度，不会吸附到锚点。
 */
export default function FloatingPanelMagneticExample() {
  return (
    <View style={styles.page}>
      <FloatingPanel anchors={[100, 220, 520]} magnetic={false}>
        <View style={styles.content}>
          <Text style={styles.title}>自由高度</Text>
          <Text style={styles.description}>拖动后可以停留在 100～520px 的任意高度。</Text>
        </View>
      </FloatingPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 360, backgroundColor: '#f7f8fa' },
  content: { gap: 8, padding: 20 },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
})
