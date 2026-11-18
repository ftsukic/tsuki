import React from 'react'

import { FloatingPanel } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 禁用拖动
 * @description draggable=false 会隐藏默认拖拽条并固定面板高度，内容仍可滚动。
 */
export default function FloatingPanelDisabledExample() {
  return (
    <View style={styles.page}>
      <FloatingPanel draggable={false} defaultHeight={180}>
        <View style={styles.content}>
          <Text style={styles.title}>固定面板</Text>
          <Text style={styles.description}>面板不可拖动，适合展示固定的底部辅助内容。</Text>
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
