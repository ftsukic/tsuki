import { useState } from 'react'
import { Button, Picker } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

const options = [
  { text: '今天', value: 'today' },
  { text: '明天', value: 'tomorrow' },
  { text: '后天', value: 'after-tomorrow' },
]

/**
 * @title Picker 底部安全区
 * @description 底部安全区由 Popup 面板统一填充，面板背景与 Home Indicator 区域保持连续且不增加底部圆角。
 */
export default function PickerSafeAreaExample() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>打开安全区示例</Button>
      <Text>在 iOS Simulator 的 Home Indicator 设备上查看底部连续背景。</Text>
      <Picker
        columns={options}
        onCancel={() => setVisible(false)}
        onConfirm={() => setVisible(false)}
        safeAreaInsetBottom
        title="选择日期"
        visible={visible}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
