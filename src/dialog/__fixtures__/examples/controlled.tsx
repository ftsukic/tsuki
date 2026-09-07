import React from 'react'

import { Button, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 受控组件
 * @description 直接使用 Dialog，通过 show 和 onShowChange 管理显示状态。
 */
export default function DialogControlledExample() {
  const [show, setShow] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setShow(true)}>打开受控 Dialog</Button>
      <Dialog
        show={show}
        title="受控 Dialog"
        message="关闭动作交由外部状态管理。"
        onShowChange={setShow}
      />
    </View>
  )
}
