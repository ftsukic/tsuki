import React, { useRef, useState } from 'react'

import { Button, closeNotify, showNotify } from '@ftsukic/tsuki'
import type { NotifyMethods } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title 命令式交互
 * @description showNotify 返回的实例可以更新 message 或关闭当前单例通知。
 */
export default function NotifyInteractionsExample() {
  const notifyRef = useRef<NotifyMethods | null>(null)
  const [active, setActive] = useState(false)

  return (
    <View style={styles.container}>
      <Button
        onPress={() => {
          notifyRef.current = showNotify({ duration: 0, message: '正在同步数据…' })
          setActive(true)
        }}
      >
        显示持续通知
      </Button>
      <Button
        disabled={!active}
        variant="outline"
        onPress={() => notifyRef.current?.setMessage('数据同步完成')}
      >
        更新通知内容
      </Button>
      <Button
        variant="outline"
        onPress={() => {
          closeNotify()
          notifyRef.current = null
          setActive(false)
        }}
      >
        关闭通知
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
