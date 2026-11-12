import React from 'react'

import { Button, showDialog } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Dialog 内容布局
 * @description 分别打开 title-only、message-only 和 title + message 三种默认 Dialog 结构。
 */
export default function DialogLayoutExample() {
  return (
    <View style={{ gap: 12 }}>
      <Button
        onPress={() => {
          void showDialog({ title: '仅标题' })
        }}
      >
        仅标题
      </Button>
      <Button
        onPress={() => {
          void showDialog({ message: '仅正文内容。' })
        }}
      >
        仅正文
      </Button>
      <Button
        onPress={() => {
          void showDialog({ title: '标题', message: '标题与正文同时展示。' })
        }}
      >
        标题与正文
      </Button>
    </View>
  )
}
