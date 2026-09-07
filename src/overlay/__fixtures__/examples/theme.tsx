import React from 'react'

import { Button, ConfigProvider, Overlay } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 主题定制
 * @description 通过 Overlay token 和 semantic styles 定制遮罩与内容区域。
 */
export default function OverlayThemeExample() {
  const [show, setShow] = useState(false)

  return (
    <ConfigProvider
      theme={{
        components: {
          Overlay: {
            backgroundColor: 'rgba(16, 42, 67, 0.82)',
            zIndex: 1800,
          },
        },
      }}
    >
      <View style={styles.container}>
        <Button onPress={() => setShow(true)}>显示主题 Overlay</Button>
        <Overlay
          show={show}
          onPress={() => setShow(false)}
          styles={{
            content: { alignItems: 'center', justifyContent: 'center' },
            root: { borderWidth: 2, borderColor: '#486581' },
          }}
        >
          <View style={styles.card}>
            <Text style={styles.text}>主题 token 与 semantic styles 可以同时使用。</Text>
            <Button color="#102a43" onPress={() => setShow(false)}>
              关闭
            </Button>
          </View>
        </Overlay>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: { alignItems: 'center', backgroundColor: '#ffffff', gap: 16, padding: 20 },
  text: { color: '#1f2937', lineHeight: 22, textAlign: 'center' },
})
