import { useState } from 'react'
import { Field, Picker } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const options = [
  { text: '北京', value: 'beijing' },
  { text: '上海', value: 'shanghai' },
  { text: '广州', value: 'guangzhou' },
]

/**
 * @title Field 联动
 * @description Field 的 custom control 直接复用 Cell 的链接语义触发 Picker。
 */
export default function PickerFieldExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>(['beijing'])
  const selectedText = options.find((option) => option.value === value[0])?.text ?? '请选择'

  return (
    <View>
      <Field<string> label="城市" value={selectedText} isLink onPress={() => setVisible(true)}>
        {({ value }) => <Text testID="picker-field-trigger">{value}</Text>}
      </Field>
      <Text>已选择：{selectedText}</Text>
      <Picker
        columns={options}
        onCancel={() => setVisible(false)}
        onConfirm={(nextValue) => {
          setValue(nextValue)
          setVisible(false)
        }}
        value={value}
        visible={visible}
      />
    </View>
  )
}
