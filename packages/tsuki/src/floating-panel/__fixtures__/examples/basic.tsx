import React from 'react'

import { FloatingPanel } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 基础用法
 * @description FloatingPanel 默认从 100px 高度开始，可在默认最大高度和最小高度之间拖动。
 */
export default function FloatingPanelBasicExample() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>页面内容</Text>
      <Text style={styles.description}>面板通过 Portal 固定在视口底部，不会被页面布局裁剪。</Text>
      <FloatingPanel>
        <View style={styles.panelContent}>
          <Text style={styles.panelTitle}>浮动面板</Text>
          <Text style={styles.description}>拖动顶部横条浏览面板内容。</Text>
        </View>
      </FloatingPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 360, gap: 12, backgroundColor: '#f7f8fa' },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  panelContent: { gap: 8, padding: 20 },
  panelTitle: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
})
