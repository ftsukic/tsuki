import { Field } from '../../..'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Field clearable
 * @description 默认 Input 的能力通过 inputProps 显式传入。
 */
export default function FieldClearableFixture() {
  const [value, setValue] = useState('可清除内容')

  return (
    <View>
      <Field
        label="昵称"
        value={value}
        onChange={setValue}
        inputProps={{ clearable: true, clearTrigger: 'always' }}
      />
      <Text>当前值：{value || '已清空'}</Text>
    </View>
  )
}
