import React from 'react'

import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Toast } from '@ftsukic/tsuki'

/**
 * @title 受控组件
 * @description 直接使用 Toast，通过 show 和 onShowChange 管理显示状态。
 */
export default function ToastControlledExample() {
  const [show, setShow] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setShow(true)}>显示受控 Toast</Button>
      <Toast show={show} message="受控提示" duration={0} closeOnClick onShowChange={setShow} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { minHeight: 180, gap: 12 },
})
