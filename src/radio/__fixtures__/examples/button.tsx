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
      <Radio.Group
        value={value}
        onChange={setValue}
        variant="button"
        direction="horizontal"
        gap={8}
      >
        <Radio value="apple">Apple</Radio>
        <Radio value="orange">Orange</Radio>
      </Radio.Group>
      <Radio.Group
        variant="button"
        defaultValue="standard"
        options={[
          { value: 'standard', label: '标准配送' },
          { value: 'next-day', label: '次日达' },
        ]}
      />
      <Radio.Group
        variant="button"
        buttonLayout="equal"
        direction="horizontal"
        buttonColumns={5}
        options={[
          { value: 'a', label: '选项 A' },
          { value: 'b', label: '一个较长的选项 B' },
          { value: 'c', label: '选项 C' },
          { value: 'd', label: '选项 D' },
          { value: 'e', label: '选项 E' },
          { value: 'f', label: '选项 F' },
          { value: 'g', label: '选项 G' },
          { value: 'h', label: '选项 H' },
        ]}
      />
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        当前选择：{String(value)}
      </Text>
    </View>
  )
}
