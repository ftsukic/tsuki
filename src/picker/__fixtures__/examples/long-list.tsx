import { useState } from 'react'
import { Cell, Picker, Popup } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

const options = Array.from({ length: 500 }, (_, index) => ({
  text: `选项 ${index + 1}`,
  value: index + 1,
}))

/**
 * @title 长列表 Picker
 * @description Cell 打开 Popup；长列表验证自定义手势滚轮的首尾居中、惯性滑动和受控值更新。
 */
export default function PickerLongListExample() {
  const [visible, setVisible] = useState(false)
  const [committed, setCommitted] = useState<readonly (string | number)[]>([10])
  const [draft, setDraft] = useState(committed)

  const handleOpen = () => {
    setDraft(committed)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)

  return (
    <View style={styles.container}>
      <Cell title="选择长列表项" value={String(committed[0])} isLink onPress={handleOpen} />
      <Text>当前值：{committed[0]}</Text>
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
          title="选择长列表项"
          onChange={setDraft}
          onConfirm={(nextValue) => {
            setCommitted(nextValue)
            setVisible(false)
          }}
          onCancel={handleCancel}
          value={draft}
        />
      </Popup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
