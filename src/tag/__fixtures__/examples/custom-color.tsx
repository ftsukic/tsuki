import { Tag } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title 自定义颜色
 * @description 使用 color 自定义背景并自动选择对比文字，也可以通过 textColor 覆盖文字颜色。
 */
export default function TagCustomColorExample() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <Tag color="#7232dd">紫色</Tag>
      <Tag color="red">红色</Tag>
      <Tag color="#ffe1e1" textColor="#ad0000">
        显式文字色
      </Tag>
      <Tag color="#7232dd" plain>
        空心紫色
      </Tag>
    </View>
  )
}
