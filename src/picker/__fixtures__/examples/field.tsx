import { useState } from 'react'
import { Cell, Field, Picker } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const options = [
  { text: '北京', value: 'beijing' },
  { text: '上海', value: 'shanghai' },
  { text: '广州', value: 'guangzhou' },
]

/**
 * @title Field 联动
 * @description Field 默认使用 Input，也可以用 children 放入 Cell 等自定义控件；这里由 Cell 负责触发 Picker。
 */
export default function PickerFieldExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>(['beijing'])
  const selectedText = options.find((option) => option.value === value[0])?.text ?? '请选择'

  return (
    <View>
      <Field label="城市">
        <Cell
          clickable
          isLink
          onPress={() => setVisible(true)}
          title={selectedText}
          testID="picker-field-trigger"
        />
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
