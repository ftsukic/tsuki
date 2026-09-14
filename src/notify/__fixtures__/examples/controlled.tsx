import React, { useRef, useState } from 'react'

import { Button, Notify } from '@ftsukic/tsuki'
import type { NotifyMethods } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title 受控组件
 * @description 使用 visible 管理显示状态，onClosed 在关闭动画完成后同步外部状态。
 */
export default function NotifyControlledExample() {
  const [visible, setVisible] = useState(false)
  const notifyRef = useRef<NotifyMethods>(null)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>显示受控通知</Button>
      <Button disabled={!visible} variant="outline" onPress={() => notifyRef.current?.close()}>
        关闭受控通知
      </Button>
      <Notify
        ref={notifyRef}
        visible={visible}
        duration={0}
        message="受控通知由外部状态管理。"
        onClosed={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, minHeight: 160 },
})
