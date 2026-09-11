import { ConfigProvider, FieldPicker } from '../../..'
import type { PickerOption } from '../../..'

const cities: readonly PickerOption[] = [
  { text: '上海', value: 'shanghai' },
  { text: '北京', value: 'beijing' },
]

/**
 * @title Field theme and semantic styles
 * @description FieldPicker 使用 Field token 和 feedback 语义样式。
 */
export default function FieldThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        components: { Field: { errorColor: '#d4380d', warningColor: '#d89614' } },
      }}
    >
      <FieldPicker
        label="城市"
        defaultValue={['shanghai']}
        columns={cities}
        errorMessage="请选择城市"
        styles={{ description: { fontStyle: 'italic' } }}
      />
    </ConfigProvider>
  )
}
