import React from 'react'

import { Radio } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title 禁用状态
 * @description Radio 自身、options 选项和整个 Radio.Group 都可以禁用。
 */
export default function Example() {
  return (
    <View style={{ gap: 12 }}>
      <Radio disabled>禁用未选中</Radio>
      <Radio disabled checked>
        禁用已选中
      </Radio>
      <Radio.Group disabled defaultValue="group">
        <Radio value="group" disabled={false}>
          Group 禁用优先
        </Radio>
        <Radio value="other">其他选项</Radio>
      </Radio.Group>
    </View>
  )
}
