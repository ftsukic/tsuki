import { useState } from 'react'
import { Button, Picker } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

const options = [
  { text: '北京', value: 'beijing' },
  { text: '上海', value: 'shanghai' },
  { text: '广州', value: 'guangzhou' },
]

/**
 * @title 默认 Picker Popup
 * @description Picker 自动使用底部 Popup，Toolbar 和滚轮内容作为一个面板同步进出动画。
 */
export default function PickerDefaultPopupExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>(['beijing'])
  const selectedText = options.find((option) => option.value === value[0])?.text ?? '请选择'

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>打开 Picker</Button>
      <Text>已选择：{selectedText}</Text>
      <Picker
        columns={options}
        onCancel={() => setVisible(false)}
        onConfirm={(nextValue) => {
          setValue(nextValue)
          setVisible(false)
        }}
        title="选择城市"
        value={value}
        visible={visible}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
