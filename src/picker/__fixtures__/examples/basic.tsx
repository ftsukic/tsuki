import { useState } from 'react'
import { Button, Picker } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const options = [
  { text: '杭州', value: 'hangzhou' },
  { text: '宁波', value: 'ningbo' },
  { text: '温州', value: 'wenzhou' },
]

/**
 * @title 基础弹层
 * @description 使用 Button 控制 Picker Popup，确认后提交选中的 value。
 */
export default function PickerBasicExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>(['hangzhou'])

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setVisible(true)}>选择城市</Button>
      <Text>当前值：{value[0]}</Text>
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
