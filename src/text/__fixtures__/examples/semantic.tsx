import { View } from 'react-native'
import { Text } from '@ftsukic/tsuki'

/**
 * @title 语义、尺寸和字重
 * @description 使用 type、size 和 weight 表达移动端常见的文本层级，不提供 Heading 体系。
 */
export default function TextSemanticExample() {
  return (
    <View style={{ gap: 8 }}>
      <Text size="large" weight="600">
        页面标题
      </Text>
      <Text>正文内容</Text>
      <Text type="secondary">次要内容</Text>
      <Text type="tertiary" size="small">
        辅助说明
      </Text>
      <Text type="disabled">不可用内容</Text>
    </View>
  )
}
