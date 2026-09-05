import type { RadioValue } from '@ftsukic/react-native-ui'
import { Radio } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Radio.Group 子节点
 * @description 使用子 Radio 自定义每个选项，支持受控值、默认值、横向布局和间距。
 */
export default function Example() {
  const [value, setValue] = useState<RadioValue>('apple')

  return (
    <View style={{ gap: 16 }}>
      <Radio.Group value={value} onChange={setValue} gap={12}>
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
        <Radio value="orange">Orange</Radio>
      </Radio.Group>
      <Radio.Group defaultValue="small" direction="horizontal" gap={20}>
        <Radio value="small">小</Radio>
        <Radio value="medium">中</Radio>
        <Radio value="large">大</Radio>
      </Radio.Group>
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        当前值：{String(value)}
      </Text>
    </View>
  )
}
