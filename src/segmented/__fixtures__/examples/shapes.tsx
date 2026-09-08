import { Segmented, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Shapes
 * @description Compare the default radius with the round capsule shape.
 */
export default function SegmentedShapesExample() {
  return (
    <View style={{ gap: 16 }}>
      <Segmented options={['默认', '第二项', '第三项']} />
      <Segmented shape="round" options={['默认', '第二项', '第三项']} />
      <Text type="secondary">圆角只由外层容器和滑动 thumb 控制，中间选项不会独立成胶囊。</Text>
    </View>
  )
}
