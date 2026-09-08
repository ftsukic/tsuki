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
      <Radio checked={false} shape="round">
        round 未选中
      </Radio>
      <Radio checked shape="round">
        round 圆形 check
      </Radio>
      <Radio checked={false} shape="square">
        square 未选中
      </Radio>
      <Radio checked shape="square">
        square 方形 check
      </Radio>
      <Radio checked={false} shape="dot">
        dot 未选中
      </Radio>
      <Radio checked shape="dot">
        dot 中心圆点
      </Radio>
      <Radio checked shape="round" labelPosition="left">
        round 标签在左侧
      </Radio>
    </View>
  )
}
