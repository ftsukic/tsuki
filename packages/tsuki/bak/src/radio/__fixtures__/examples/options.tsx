import React from 'react'

import type { RadioOption, RadioValue } from '@ftsukic/tsuki'
import { Radio } from '@ftsukic/tsuki'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title options 分组
 * @description 使用 options 快速生成选项，适合标签简单且结构一致的单选组。
 */
export default function Example() {
  const [value, setValue] = useState<RadioValue>(1)
  const options: RadioOption[] = [
    { value: 1, label: '标准配送' },
    { value: 2, label: '次日达' },
    { value: 3, label: '暂不可用', disabled: true },
  ]

  return (
    <View style={{ gap: 12 }}>
      <Radio.Group value={value} onChange={setValue} options={options} />
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        当前值：{String(value)}
      </Text>
    </View>
  )
}
