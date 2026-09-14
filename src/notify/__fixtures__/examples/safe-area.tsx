import React, { useState } from 'react'

import { Button, Notify } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title 顶部安全区
 * @description Notify 默认适配 SafeAreaInsetsContext 的 top inset，也可以显式关闭适配。
 */
export default function NotifySafeAreaExample() {
  const [visible, setVisible] = useState(false)
  const [withSafeArea, setWithSafeArea] = useState(true)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>显示{withSafeArea ? '安全区' : '普通'}通知</Button>
      <Button variant="outline" onPress={() => setWithSafeArea((current) => !current)}>
        {withSafeArea ? '关闭' : '开启'}顶部安全区适配
      </Button>
      <Notify
        visible={visible}
        duration={0}
        message="通知内容从安全区下方开始"
        safeAreaInsetTop={withSafeArea}
        onClosed={() => setVisible(false)}
      />
      <Button variant="outline" disabled={!visible} onPress={() => setVisible(false)}>
        请求关闭
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, minHeight: 190 },
})
