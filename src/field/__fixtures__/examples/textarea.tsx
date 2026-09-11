import { Field } from '../../..'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Field textarea
 * @description 默认 Input 通过 inputProps 配置 multiline 和 autoSize。
 */
export default function FieldTextareaFixture() {
  const [value, setValue] = useState('')

  return (
    <View>
      <Field
        label="备注"
        value={value}
        onChange={setValue}
        vertical
        inputProps={{
          multiline: true,
          autoSize: { minRows: 2, maxRows: 5 },
          placeholder: '请输入备注',
        }}
      />
    </View>
  )
}
