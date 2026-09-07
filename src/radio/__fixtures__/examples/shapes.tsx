import React from 'react'

import { Radio } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title 指示器形状
 * @description shape 支持圆形和方形指示器，labelPosition 可将标签放到左侧。
 */
export default function Example() {
  return (
    <View style={{ gap: 12 }}>
      <Radio checked shape="round">
        圆形选中
      </Radio>
      <Radio checked shape="square">
        方形选中
      </Radio>
      <Radio checked shape="square" labelPosition="left">
        标签在左侧
      </Radio>
    </View>
  )
}
