import { useState } from 'react'
import { Cell, FieldInput } from '../../..'
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
        center
        title="用户名"
        label="请输入登录用户名"
        onChange={setName}
        placeholder="请输入用户名"
        clearable
        clearTrigger="always"
      />
      <Text>当前值：{name || '—'}</Text>
      <Cell.Group border={false}>
        <FieldInput title="禁用" defaultValue="不可编辑" disabled />
        <FieldInput title="只读" defaultValue="只读内容" readOnly />
        <FieldInput
          title="密码"
          defaultValue="只读内容"
          type="password"
          clearable
          onChange={setName}
        />
      </Cell.Group>
    </View>
  )
}
