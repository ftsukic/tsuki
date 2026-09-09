import { useState } from 'react'
import { Button, Cell, TimePicker } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'
import type { TimePickerValue } from '@ftsukic/tsuki'

/**
 * @title Popup 组合
 * @description Cell 和 Button 都可以打开 TimePicker 的现有底部 Popup，确认后展示结果。
 */
export default function TimePickerPopupExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<TimePickerValue>(['09', '30'])

  return (
    <View style={{ gap: 8 }}>
      <Cell isLink onPress={() => setVisible(true)} title="预约时间" value={value.join(':')} />
      <Button onPress={() => setVisible(true)}>选择时间</Button>
      <Text>已确认：{value.join(':')}</Text>
      <TimePicker
        onCancel={() => setVisible(false)}
        onConfirm={(nextValue) => {
          setValue(nextValue)
          setVisible(false)
        }}
        title="选择时间"
        value={value}
        visible={visible}
      />
    </View>
  )
}
