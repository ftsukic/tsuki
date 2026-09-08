import { Segmented, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Custom labels
 * @description Render option labels with custom React nodes while keeping option values stable.
 */
export default function SegmentedCustomLabelExample() {
  return (
    <View style={{ gap: 12 }}>
      <Segmented
        defaultValue="list"
        options={[
          { label: <Text>列表</Text>, value: 'list' },
          { label: <Text>看板</Text>, value: 'board' },
        ]}
      />
      <Text type="secondary">label 支持自定义 ReactNode，value 仍用于状态管理。</Text>
    </View>
  )
}
