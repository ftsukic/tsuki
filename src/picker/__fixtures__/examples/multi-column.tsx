import { useState } from 'react'
import { Cell, Picker, Popup } from '@ftsukic/tsuki'
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
  const [committed, setCommitted] = useState<readonly (string | number)[]>(['zhejiang', 'hangzhou'])
  const [draft, setDraft] = useState(committed)

  const handleOpen = () => {
    setDraft(committed)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)

  return (
    <View style={{ gap: 12 }}>
      <Cell title="选择省市" value={committed.join(' / ')} isLink onPress={handleOpen} />
      <Text>{committed.join(' / ')}</Text>
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
          columns={columns}
          title="选择省市"
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
