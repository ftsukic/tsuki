import { Field } from '../../..'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Field password
 * @description 默认 Input 的 password 和 clearable 能力通过 inputProps 配置。
 */
export default function FieldPasswordFixture() {
  const [value, setValue] = useState('')

  return (
    <View>
      <Field
        label="密码"
        value={value}
        onChange={setValue}
        inputProps={{ type: 'password', clearable: true, placeholder: '请输入密码' }}
      />
      <Text>已输入 {value.length} 个字符</Text>
    </View>
  )
}
