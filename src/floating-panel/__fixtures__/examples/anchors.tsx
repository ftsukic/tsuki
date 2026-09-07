import React from 'react'

import { FloatingPanel } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 自定义锚点
 * @description anchors 定义停靠位置，height 与 onHeightChange 可用于实时展示当前面板高度。
 */
export default function FloatingPanelAnchorsExample() {
  const anchors = [100, 280, 520]
  const [height, setHeight] = useState(anchors[0])

  return (
    <View style={styles.page}>
      <Text style={styles.caption}>当前高度：{Math.round(height)}px</Text>
      <FloatingPanel
        height={height}
        anchors={anchors}
        onHeightChange={setHeight}
        onHeightChangeEnd={setHeight}
      >
        <View style={styles.content}>
          <Text style={styles.title}>三个停靠位置</Text>
          <Text style={styles.description}>松手后会吸附到 100、280 或 520px。</Text>
        </View>
      </FloatingPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 360, gap: 12, padding: 16, backgroundColor: '#f7f8fa' },
  caption: { color: '#68788d', fontSize: 13 },
  content: { gap: 8, padding: 20 },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
})
