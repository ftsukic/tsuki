import { Field } from '../../..'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Field textarea
 * @description Field 透传 multiline 和 autoSize，内容增长时标签保持顶部对齐。
 */
export default function FieldTextareaFixture() {
  const [value, setValue] = useState('')

  return (
    <View>
      <Field
        label="备注"
        multiline
        autoSize={{ minRows: 2, maxRows: 5 }}
        placeholder="请输入备注"
        value={value}
        onChangeText={setValue}
      />
    </View>
  )
}
