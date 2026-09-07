import { Button, Overlay, Provider } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 透明遮罩与动画
 * @description backgroundColor 可以设为 transparent，duration 使用毫秒并支持受控开关。
 */
export default function OverlayInteractionsExample() {
  const [show, setShow] = useState(false)
  const [count, setCount] = useState(0)

  return (
    <Provider>
      <View style={styles.container}>
        <Button onPress={() => setShow(true)}>显示透明 Overlay</Button>
        <Text style={styles.caption}>遮罩点击次数：{count}</Text>
        <Overlay
          show={show}
          backgroundColor="transparent"
          duration={180}
          onPress={() => {
            setCount((value) => value + 1)
            setShow(false)
          }}
        />
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  caption: { color: '#68788d', fontSize: 13 },
})
