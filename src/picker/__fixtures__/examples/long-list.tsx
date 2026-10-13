import { useState } from 'react'
import { Cell, Picker, Popup, Switch } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

const options = Array.from({ length: 500 }, (_, index) => ({
  text: `选项 ${index + 1}`,
  value: index + 1,
}))

/**
 * @title 长列表 Picker
 * @description 500 项数据；切换 virtual 对比窗口与全量渲染，验证首尾居中、惯性滑动和受控值更新。
 */
export default function PickerLongListExample() {
  const [visible, setVisible] = useState(false)
  const [virtual, setVirtual] = useState(true)
  const [committed, setCommitted] = useState<readonly (string | number)[]>([10])
  const [draft, setDraft] = useState(committed)

  const handleOpen = () => {
    setDraft(committed)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)

  return (
    <View style={styles.container}>
      <Cell title="虚拟滚动" trailing={<Switch value={virtual} onChange={setVirtual} />} />
      <Cell title="选择长列表项" value={String(committed[0])} showArrow onPress={handleOpen} />
      <Text>当前值：{committed[0]}</Text>
      <Popup
        visible={visible}
        position="bottom"
        round
        closeOnPressOverlay
        safeAreaInsetBottom
        onRequestClose={handleCancel}
      >
        <Picker
          columns={options}
          virtual={virtual}
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
