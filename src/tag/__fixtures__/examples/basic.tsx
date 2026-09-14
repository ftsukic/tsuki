import { Tag } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title 基础类型
 * @description Tag 支持 default、primary、success、warning 和 danger 五种语义类型。
 */
export default function TagBasicExample() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <Tag>默认</Tag>
      <Tag type="primary">主要</Tag>
      <Tag type="success">成功</Tag>
      <Tag type="warning">警告</Tag>
      <Tag type="danger">危险</Tag>
    </View>
  )
}
