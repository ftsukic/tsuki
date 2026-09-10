import { Field } from '../../..'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Field clearable
 * @description Field 将 clearable 和清除回调直接透传给内部 Input。
 */
export default function FieldClearableFixture() {
  const [value, setValue] = useState('可清除内容')

  return (
    <View>
      <Field label="昵称" clearable clearTrigger="always" value={value} onChangeText={setValue} />
      <Text>当前值：{value || '已清空'}</Text>
    </View>
  )
}
