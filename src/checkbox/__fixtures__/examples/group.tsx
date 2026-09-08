import type { CheckboxValue } from '@ftsukic/tsuki'
import { Checkbox } from '@ftsukic/tsuki'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Checkbox.Group
 * @description 使用 Checkbox.Group 管理多个 name，并演示横向布局和 group disabled。
 */
export default function Example() {
  const [value, setValue] = useState<CheckboxValue[]>(['apple'])

  return (
    <View style={{ gap: 16 }}>
      <Checkbox.Group value={value} onChange={setValue} gap={12}>
        <Checkbox name="apple">Apple</Checkbox>
        <Checkbox name="banana">Banana</Checkbox>
        <Checkbox name="orange">Orange</Checkbox>
      </Checkbox.Group>
      <Checkbox.Group direction="horizontal" defaultValue={['small']} gap={20}>
        <Checkbox name="small">小</Checkbox>
        <Checkbox name="medium">中</Checkbox>
        <Checkbox name="large">大</Checkbox>
      </Checkbox.Group>
      <Checkbox.Group disabled defaultValue={['locked']}>
        <Checkbox name="locked">Group 禁用优先</Checkbox>
        <Checkbox name="other" disabled={false}>
          其他选项
        </Checkbox>
      </Checkbox.Group>
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        当前值：{value.join(', ') || '无'}
      </Text>
    </View>
  )
}
