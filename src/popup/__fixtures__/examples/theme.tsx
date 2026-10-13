import React from 'react'

import { Button, ConfigProvider, Popup } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 主题定制
 * @description 通过 Popup token 和 semantic styles 定制面板、遮罩和宿主层。
 */
export default function PopupThemeExample() {
  const [visible, setVisible] = useState(false)

  return (
    <ConfigProvider
      theme={{
        components: {
          Popup: {
            backgroundColor: '#102a43',
            borderRadius: 18,
            overlayColor: 'rgba(16, 42, 67, 0.72)',
          },
        },
      }}
    >
      <View style={styles.container}>
        <Button onPress={() => setVisible(true)}>显示主题 Popup</Button>
        <Popup
          visible={visible}
          round
          closeOnPressOverlay
          onRequestClose={() => setVisible(false)}
          style={{ margin: 4 }}
          styles={{
            container: { width: 260, padding: 20, borderWidth: 1, borderColor: '#486581' },
            mask: { opacity: 0.8 },
          }}
        >
          <View style={styles.panel}>
            <Text style={styles.text}>Popup 使用深色主题 token。</Text>
            <Button color="#9fb3c8" variant="outlined" onPress={() => setVisible(false)}>
              关闭
            </Button>
          </View>
        </Popup>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  panel: { gap: 16 },
  text: { color: '#f0f4f8', lineHeight: 22 },
})
