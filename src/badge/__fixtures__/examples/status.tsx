import React from 'react'

/**
 * @title 状态点
 * @description status 用于展示成功、处理中、默认、错误和警告状态，也可以附带文字。
 */
import { Badge } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Example() {
  return (
    <View style={{ gap: 10 }}>
      <Badge status="success" />
      <Badge status="success" text="成功" />
      <Badge status="processing" text="处理中" />
      <Badge status="default" text="默认" />
      <Badge status="error" text="错误" />
      <Badge status="warning" text="警告" />
    </View>
  )
}
