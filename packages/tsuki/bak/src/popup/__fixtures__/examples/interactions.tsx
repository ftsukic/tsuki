import React from 'react'

import { Button, Popup } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 遮罩交互
 * @description overlay 控制遮罩，onPressOverlay 监听点击，closeOnPressOverlay 发出受控关闭请求。
 */
export default function PopupInteractionsExample() {
  const [visible, setVisible] = useState(false)
  const [lastAction, setLastAction] = useState('尚未点击遮罩')

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>显示并点击遮罩</Button>
      <Text style={styles.caption}>{lastAction}</Text>
      <Popup
        visible={visible}
        closeOnPressOverlay
        onPressOverlay={() => setLastAction('已点击遮罩')}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.panel}>
          <Text>点击面板外部会触发 onPressOverlay。</Text>
          <Button onPress={() => setVisible(false)}>关闭</Button>
        </View>
      </Popup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  caption: { color: '#68788d', fontSize: 13 },
  panel: { width: 260, gap: 16, padding: 20 },
})
