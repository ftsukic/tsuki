import { ConfigProvider, Field, Input } from '../../..'

/**
 * @title Field semantic theme
 * @description 展示 Field 状态 token 和语义样式插槽。
 */
export default function FieldThemeFixture() {
  return (
    <ConfigProvider
      theme={{ components: { Field: { errorColor: '#d4380d', warningColor: '#d89614' } } }}
    >
      <Field
        label="邮箱"
        errorMessage="请输入有效邮箱"
        styles={{ description: { fontStyle: 'italic' } }}
      >
        <Input placeholder="name@example.com" bordered />
      </Field>
    </ConfigProvider>
  )
}
