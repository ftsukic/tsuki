import React from 'react'

import { Button, Dialog, showDialog } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 圆角按钮
 * @description theme="round-button" 使用 Vant 风格的圆角操作按钮。
 */
export default function DialogRoundExample() {
  const [show, setShow] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setShow(true)}>圆角按钮风格</Button>
      <Dialog
        show={show}
        theme="round-button"
        title="圆角按钮"
        message="适合强调确认和取消两个动作。"
        showCancelButton
        onShowChange={setShow}
      />
      <Button
        onPress={() =>
          showDialog({ theme: 'round-button', title: '仅标题', showCancelButton: true })
        }
      >
        标题
      </Button>
    </View>
  )
}
