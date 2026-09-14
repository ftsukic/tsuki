import { Tag } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title 尺寸
 * @description small、medium 和 large 三种尺寸适合不同密度的标签布局。
 */
export default function TagSizesExample() {
  return (
    <View style={{ alignItems: 'flex-start', gap: 8 }}>
      <Tag size="small" type="primary">
        小尺寸
      </Tag>
      <Tag size="medium" type="primary">
        中尺寸
      </Tag>
      <Tag size="large" type="primary">
        大尺寸
      </Tag>
    </View>
  )
}
