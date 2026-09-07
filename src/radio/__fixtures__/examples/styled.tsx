import React from 'react'

import { Radio } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

/**
 * @title 自定义内容与语义样式
 * @description children 支持自定义节点，styles 可分别覆盖 root、indicator 和 label。
 */
export default function Example() {
  return (
    <Radio
      defaultChecked
      labelPosition="left"
      styles={({ state }) => ({
        root: { padding: 8, borderRadius: 8, backgroundColor: '#f5f8ff' },
        indicator: { borderWidth: state.checked ? 2 : 1 },
        label: { color: '#1989fa', fontWeight: '600' },
      })}
    >
      <View>
        <Text>接收更新</Text>
        <Text style={{ color: '#68788d', fontSize: 12 }}>包含版本和安全通知</Text>
      </View>
    </Radio>
  )
}
