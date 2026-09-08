import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Controlled tabs
 * @description Manage the active tab value in the parent component.
 */
export default function ControlledTabsExample() {
  const [value, setValue] = useState<string | number>('notice')

  return (
    <View style={{ gap: 12 }}>
      <Tabs value={value} onChange={setValue}>
        <Tab name="notice" title="通知">
          <Text>通知列表</Text>
        </Tab>
        <Tab name="message" title="消息">
          <Text>消息列表</Text>
        </Tab>
      </Tabs>
      <Text type="secondary">当前值：{value}</Text>
    </View>
  )
}
