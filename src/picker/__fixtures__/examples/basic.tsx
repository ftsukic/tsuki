import { useState } from 'react'
import { Cell, Picker, Popup } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const options = [
  { text: '杭州', value: 'hangzhou' },
  { text: '宁波', value: 'ningbo' },
  { text: '温州', value: 'wenzhou' },
]

/**
 * @title 基础弹层
 * @description 使用 Cell 打开 Popup；Picker 只负责滚轮选择，确认后提交选中的 value。
 */
export default function PickerBasicExample() {
  const [visible, setVisible] = useState(false)
  const [committed, setCommitted] = useState<readonly (string | number)[]>(['hangzhou'])
  const [draft, setDraft] = useState(committed)
  const selectedText = options.find((option) => option.value === committed[0])?.text ?? '请选择'

  const handleOpen = () => {
    setDraft(committed)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)

  return (
    <View style={{ gap: 12 }}>
      <Cell title="选择城市" value={selectedText} isLink onPress={handleOpen} />
      <Text>当前值：{selectedText}</Text>
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
          title="选择城市"
          value={draft}
          onChange={setDraft}
          onConfirm={(nextValue) => {
            setCommitted(nextValue)
            setVisible(false)
          }}
          onCancel={handleCancel}
        />
      </Popup>
    </View>
  )
}
