import { ConfigProvider, FieldInput } from '../../..'

/**
 * @title Field theme and semantic styles
 * @description Field 系列组合使用 Field token，表单语义样式只作用于 feedback。
 */
export default function FieldThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        components: { Field: { errorColor: '#d4380d', warningColor: '#d89614' } },
      }}
    >
      <FieldInput
        label="邮箱"
        defaultValue="name@example.com"
        errorMessage="请输入有效邮箱"
        styles={{ description: { fontStyle: 'italic' } }}
      />
    </ConfigProvider>
  )
}
