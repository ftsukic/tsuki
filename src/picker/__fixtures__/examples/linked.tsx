import { useState } from 'react'
import { Cell, Picker, Popup } from '@ftsukic/tsuki'
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
 * @description Cell 打开 Popup；父级变化后，子级列会自动刷新并校正到可用的第一项。
 */
export default function PickerLinkedExample() {
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
      <Cell title="选择地区" value={committed.join(' / ')} isLink onPress={handleOpen} />
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
          columns={options}
          title="选择地区"
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
