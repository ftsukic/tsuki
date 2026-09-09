import { useState } from 'react'
import { Button, Picker } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const columns = [
  [
    { text: '浙江', value: 'zhejiang' },
    { text: '江苏', value: 'jiangsu' },
  ],
  [
    { text: '杭州', value: 'hangzhou' },
    { text: '南京', value: 'nanjing' },
  ],
]

/**
 * @title 多列 Picker
 * @description 多列选择器会以数组顺序渲染多个独立滚轮。
 */
export default function PickerMultiColumnExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>(['zhejiang', 'hangzhou'])

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setVisible(true)}>选择省市</Button>
      <Text>{value.join(' / ')}</Text>
      <Picker
        columns={columns}
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
