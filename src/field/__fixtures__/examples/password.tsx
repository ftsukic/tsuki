import { Field } from '../../..'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Field password
 * @description Field 直接复用 Input 的 password 和 clearable 能力。
 */
export default function FieldPasswordFixture() {
  const [value, setValue] = useState('')

  return (
    <View>
      <Field
        label="密码"
        type="password"
        clearable
        placeholder="请输入密码"
        value={value}
        onChangeText={setValue}
      />
      <Text>已输入 {value.length} 个字符</Text>
    </View>
  )
}
