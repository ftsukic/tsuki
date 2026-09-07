import { Button, Overlay, Provider } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 基础用法
 * @description 使用 show 控制遮罩显示，点击遮罩后由调用方关闭组件。
 */
export default function OverlayBasicExample() {
  const [show, setShow] = useState(false)

  return (
    <Provider>
      <View>
        <Button onPress={() => setShow(true)}>显示 Overlay</Button>
        <Overlay show={show} onPress={() => setShow(false)} />
      </View>
    </Provider>
  )
}
