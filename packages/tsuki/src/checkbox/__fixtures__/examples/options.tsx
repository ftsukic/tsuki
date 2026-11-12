import type { CheckboxOption, CheckboxValue } from '@ftsukic/tsuki'
import { Checkbox } from '@ftsukic/tsuki'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title options 分组
 * @description 使用 options 快速生成选项，适合标签简单且结构一致的多选组。
 */
export default function Example() {
  const [value, setValue] = useState<CheckboxValue[]>(['email'])
  const options: CheckboxOption[] = [
    { value: 'email', label: '邮件' },
    { value: 'sms', label: '短信' },
    { value: 'push', label: '推送', disabled: true },
  ]

  return (
    <View style={{ gap: 12 }}>
      <Checkbox.Group value={value} onChange={setValue} options={options} />
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        当前选择：{value.join(', ') || '无'}
      </Text>
    </View>
  )
}
