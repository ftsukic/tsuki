import { Field } from '../../..'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Field basic input
 * @description 不提供 children 时，Field 自动创建一个 Input，value 和 onChange 组成数据契约。
 */
export default function FieldBasicFixture() {
  const [value, setValue] = useState('')

  return (
    <View>
      <Field
        label="用户名"
        value={value}
        onChange={setValue}
        inputProps={{ placeholder: '请输入用户名' }}
      />
      <Text>当前值：{value || '—'}</Text>
      <Field label="禁用" disabled defaultValue="不可编辑" inputProps={{ testID: 'disabled' }} />
      <Field label="只读" readOnly defaultValue="只读内容" />
    </View>
  )
}
