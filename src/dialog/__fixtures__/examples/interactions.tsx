import React from 'react'

import { Button, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 遮罩与禁用
 * @description closeOnClickOverlay 开启后可点击遮罩关闭，也可以分别禁用确认和取消按钮。
 */
export default function DialogInteractionsExample() {
  const [show, setShow] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setShow(true)}>打开交互示例</Button>
      <Dialog
        show={show}
        title="暂不可操作"
        message="确认按钮当前被禁用，点击遮罩可以关闭。"
        showCancelButton
        confirmButtonDisabled
        closeOnClickOverlay
        onShowChange={setShow}
      />
    </View>
  )
}
