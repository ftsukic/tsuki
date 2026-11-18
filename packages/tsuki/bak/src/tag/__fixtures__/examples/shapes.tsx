import { Tag } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title 形状和空心样式
 * @description plain、round 和 mark 分别展示空心、全圆角和右侧圆角样式。
 */
export default function TagShapesExample() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <Tag type="primary" plain>
        空心
      </Tag>
      <Tag type="success" round>
        圆角
      </Tag>
      <Tag type="danger" mark>
        标记
      </Tag>
      <Tag type="warning" plain mark>
        空心标记
      </Tag>
    </View>
  )
}
