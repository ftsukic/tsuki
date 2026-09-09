import { useState } from 'react'
import { Button, Picker } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const options = [
  {
    text: '浙江',
    value: 'zhejiang',
    children: [
      { text: '杭州', value: 'hangzhou' },
      { text: '宁波', value: 'ningbo' },
    ],
  },
  {
    text: '江苏',
    value: 'jiangsu',
    children: [
      { text: '南京', value: 'nanjing' },
      { text: '苏州', value: 'suzhou' },
    ],
  },
]

/**
 * @title 级联 Picker
 * @description 父级变化后，子级列会自动刷新并校正到可用的第一项。
 */
export default function PickerLinkedExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>(['zhejiang', 'hangzhou'])

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setVisible(true)}>选择地区</Button>
      <Text>{value.join(' / ')}</Text>
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
