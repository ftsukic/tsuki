import React from 'react'

import { Button, Overlay } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 组件预览
 */
export default function OverlayOverview() {
  const [show, setShow] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>全屏遮罩</Text>
      <Button onPress={() => setShow(true)}>显示 Overlay</Button>
      <Overlay show={show} onPress={() => setShow(false)}>
        <View style={styles.content}>
          <Text style={styles.title}>Overlay 内容</Text>
          <Text style={styles.description}>点击内容区域不会触发遮罩的 onPress。</Text>
          <Button onPress={() => setShow(false)}>关闭</Button>
        </View>
      </Overlay>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 20 },
  caption: { color: '#68788d', fontSize: 14 },
  content: { alignItems: 'center', gap: 16, justifyContent: 'center', padding: 20 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  description: { color: '#ffffff', textAlign: 'center' },
})
