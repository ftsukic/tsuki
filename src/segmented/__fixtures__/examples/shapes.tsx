import { Segmented, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Shapes
 * @description Compare default, round, and single-instance custom radius values.
 */
export default function SegmentedShapesExample() {
  return (
    <View style={{ gap: 16 }}>
      <Segmented options={['默认', '第二项', '第三项']} />
      <Segmented shape="round" options={['默认', '第二项', '第三项']} />
      <Segmented borderRadius={12} options={['默认', '第二项', '第三项']} />
      <Text type="secondary">
        borderRadius 可单实例统一设置外层容器、selected thumb 和 pressed feedback
        的圆角；中间选项不会独立成胶囊。
      </Text>
    </View>
  )
}
