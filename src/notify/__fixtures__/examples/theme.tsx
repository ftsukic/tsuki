import React, { useState } from 'react'

import { Button, ConfigProvider, Notify } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title 主题和单次样式
 * @description 通过 Notify token 统一定制通知，并用 color、backgroundColor 和 textStyle 覆盖单次实例。
 */
export default function NotifyThemeExample() {
  const [visible, setVisible] = useState(false)

  return (
    <ConfigProvider
      theme={{
        components: {
          Notify: {
            fontSize: 15,
            paddingHorizontal: 20,
            paddingVertical: 14,
            primaryBackgroundColor: '#102a43',
            textColor: '#d9f7be',
          },
        },
      }}
    >
      <View style={styles.container}>
        <Button onPress={() => setVisible(true)}>显示主题通知</Button>
        <Notify
          visible={visible}
          duration={0}
          message="这是主题化的通知"
          backgroundColor="#334e68"
          color="#ffffff"
          style={styles.notify}
          textStyle={styles.notifyText}
          onClosed={() => setVisible(false)}
        />
        <Button variant="outline" disabled={!visible} onPress={() => setVisible(false)}>
          请求关闭
        </Button>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, minHeight: 160 },
  notify: { borderBottomWidth: 2, borderColor: '#7dd3fc' },
  notifyText: { fontWeight: '700' },
})
