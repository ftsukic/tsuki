import { Segmented, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Custom labels
 * @description Render custom React node labels and provide their radio names explicitly.
 */
export default function SegmentedCustomLabelExample() {
  return (
    <View style={{ gap: 12 }}>
      <Segmented
        block
        defaultValue="list"
        options={[
          { label: <Text>列表</Text>, value: 'list', accessibilityLabel: '列表视图' },
          { label: <Text>看板</Text>, value: 'board', accessibilityLabel: '看板视图' },
        ]}
      />
      <Text type="secondary">
        自定义 label 可用 accessibilityLabel 指定选项名称；value 仍用于状态管理。
      </Text>
    </View>
  )
}
