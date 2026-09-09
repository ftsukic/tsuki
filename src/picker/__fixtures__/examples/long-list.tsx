import { useState } from 'react'
import { Button, Picker } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

const options = Array.from({ length: 20 }, (_, index) => ({
  text: `选项 ${index + 1}`,
  value: index + 1,
}))

/**
 * @title 长列表 Picker
 * @description 长列表通过原生滚轮吸附到选中行，首尾选项都能滚动到视口中央。
 */
export default function PickerLongListExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>([10])

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>选择长列表项</Button>
      <Text>当前值：{value[0]}</Text>
      <Picker
        columns={options}
        defaultValue={value}
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

const styles = StyleSheet.create({
  container: { gap: 12 },
})
