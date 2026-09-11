import { ConfigProvider, Field } from '../../..'
import { Text } from 'react-native'

/**
 * @title Field theme and semantic styles
 * @description Field 的状态 token 和语义样式只作用于 Form Item shell。
 */
export default function FieldThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        components: { Field: { errorColor: '#d4380d', warningColor: '#d89614' } },
      }}
    >
      <Field
        label="邮箱"
        errorMessage="请输入有效邮箱"
        styles={{ description: { fontStyle: 'italic' } }}
      >
        <Text>name@example.com</Text>
      </Field>
    </ConfigProvider>
  )
}
