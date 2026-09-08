import type { RadioValue } from '@ftsukic/tsuki'
import { Radio } from '@ftsukic/tsuki'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Button Radio
 * @description Radio button 使用内容自适应宽度，保留 Group 的单选和 disabled 语义。
 */
export default function Example() {
  const [value, setValue] = useState<RadioValue>('apple')

  return (
    <View style={{ gap: 12 }}>
      <Radio>Default radio</Radio>
      <Radio variant="button" disabled>
        Disabled button
      </Radio>
      <Radio.Group value={value} onChange={setValue} direction="horizontal" gap={8}>
        <Radio variant="button" value="apple">
          Apple
        </Radio>
        <Radio variant="button" value="orange">
          Orange
        </Radio>
      </Radio.Group>
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        当前选择：{String(value)}
      </Text>
    </View>
  )
}
