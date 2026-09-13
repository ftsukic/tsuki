import { useState } from 'react'
import { Cell, Picker, Popup } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

const options = [
  { text: '今天', value: 'today' },
  { text: '明天', value: 'tomorrow' },
  { text: '后天', value: 'after-tomorrow' },
]

/**
 * @title Picker 底部安全区
 * @description Cell 打开 Popup；底部安全区由 Popup 面板统一填充，面板背景与 Home Indicator 区域保持连续。
 */
export default function PickerSafeAreaExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<readonly (string | number)[]>(['today'])
  const [draft, setDraft] = useState(value)

  const handleOpen = () => {
    setDraft(value)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)

  return (
    <View style={styles.container}>
      <Cell title="选择日期" value={value[0]} isLink onPress={handleOpen} />
      <Text>在 iOS Simulator 的 Home Indicator 设备上查看底部连续背景。</Text>
      <Popup
        visible={visible}
        position="bottom"
        round
        closeOnPressOverlay
        safeAreaInsetBottom
        destroyOnClosed
        onRequestClose={handleCancel}
      >
        <Picker
          columns={options}
          title="选择日期"
          value={draft}
          onChange={setDraft}
          onConfirm={(nextValue) => {
            setValue(nextValue)
            setVisible(false)
          }}
          onCancel={handleCancel}
        />
      </Popup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
