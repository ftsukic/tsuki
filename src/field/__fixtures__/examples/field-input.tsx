import { useState } from 'react'
import { FieldInput } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title FieldInput
 * @description FieldInput 直接组合 Cell 和 Input，并统一使用字段的 value/onChange contract。
 */
export default function FieldInputFixture() {
  const [name, setName] = useState('')

  return (
    <View>
      <FieldInput
        label="用户名"
        value={name}
        onChange={setName}
        placeholder="请输入用户名"
        clearable
        clearTrigger="always"
      />
      <Text>当前值：{name || '—'}</Text>
      <FieldInput label="禁用" defaultValue="不可编辑" disabled />
      <FieldInput label="只读" defaultValue="只读内容" readOnly />
    </View>
  )
}
