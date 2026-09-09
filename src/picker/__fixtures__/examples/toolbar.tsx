import { useState } from 'react'
import { PickerToolbar } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

/**
 * @title PickerToolbar
 * @description Toolbar 可独立使用，并通过统一的 InteractionPressable 提供取消和确认操作。
 */
export default function PickerToolbarExample() {
  const [message, setMessage] = useState('')

  return (
    <View>
      <PickerToolbar
        onCancel={() => setMessage('已取消')}
        onConfirm={() => setMessage('已确认')}
        title="选择城市"
      />
      <Text>{message}</Text>
    </View>
  )
}
