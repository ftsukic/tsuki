import { Segmented, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Notice unread/read
 * @description Use Segmented for an unread and read notification filter.
 */
export default function NoticeSegmentedExample() {
  const [value, setValue] = useState<string | number>('unread')

  return (
    <View style={{ gap: 12 }}>
      <Segmented
        shape="round"
        value={value}
        onChange={setValue}
        options={[
          { label: '未读通知', value: 'unread' },
          { label: '已读通知', value: 'read' },
        ]}
      />
      <Text type="secondary">当前筛选：{value === 'unread' ? '未读通知' : '已读通知'}</Text>
    </View>
  )
}
