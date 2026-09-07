import React from 'react'

import { Button, Popup } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 基础用法
 * @description Popup 通过 visible 受控显示，默认居中并使用 PortalHost 承载浮层。
 */
export default function PopupBasicExample() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>显示 Popup</Button>
      <Popup visible={visible} round closeOnPressOverlay onRequestClose={() => setVisible(false)}>
        <View style={styles.card}>
          <Text style={styles.title}>居中弹层</Text>
          <Text style={styles.description}>内容由调用方管理，visible 关闭后默认保持挂载。</Text>
          <Button onPress={() => setVisible(false)}>关闭</Button>
        </View>
      </Popup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: { width: 260, gap: 16, padding: 20 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
})
