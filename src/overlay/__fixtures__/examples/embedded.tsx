import React from 'react'

import { Button, Overlay } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 嵌入内容
 * @description children 会显示在遮罩上方，可放置按钮等交互内容。
 */
export default function OverlayEmbeddedExample() {
  const [show, setShow] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setShow(true)}>显示内容</Button>
      <Overlay show={show} onPress={() => setShow(false)}>
        <View style={styles.card}>
          <Text style={styles.title}>嵌入内容</Text>
          <Text style={styles.description}>子内容可以继续响应自己的触摸事件。</Text>
          <Button onPress={() => setShow(false)}>关闭</Button>
        </View>
      </Overlay>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: { alignItems: 'center', backgroundColor: '#ffffff', gap: 12, padding: 20 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', textAlign: 'center' },
})
