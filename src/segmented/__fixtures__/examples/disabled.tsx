import { Segmented, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Disabled segmented
 * @description Show both an individually disabled option and a fully disabled control.
 */
export default function DisabledSegmentedExample() {
  return (
    <View style={{ gap: 16 }}>
      <Segmented
        defaultValue="available"
        options={[
          { label: '可用', value: 'available' },
          { label: '暂不可用', value: 'disabled', disabled: true },
          { label: '其他', value: 'another' },
        ]}
      />
      <Segmented disabled defaultValue="one" options={['one', 'two', 'three']} />
      <Text type="secondary">禁用状态不会触发切换。</Text>
    </View>
  )
}
