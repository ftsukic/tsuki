import React from 'react'

import { Button, closeNotify, showNotify } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title 类型
 * @description 通过 type 展示 primary、success、warning 和 error 四种通知颜色。
 */
export default function NotifyTypesExample() {
  return (
    <View style={styles.container}>
      <Button onPress={() => showNotify({ duration: 1800, message: '这是一条普通通知' })}>
        primary
      </Button>
      <Button
        type="success"
        onPress={() => showNotify({ duration: 1800, message: '保存成功', type: 'success' })}
      >
        success
      </Button>
      <Button
        type="warning"
        onPress={() => showNotify({ duration: 1800, message: '请检查输入内容', type: 'warning' })}
      >
        warning
      </Button>
      <Button
        type="danger"
        onPress={() => showNotify({ duration: 1800, message: '操作失败', type: 'error' })}
      >
        error
      </Button>
      <Button variant="outline" onPress={closeNotify}>
        关闭当前通知
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
