import { Collapse, CollapseItem, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Controlled collapse
 * @description Keep active panel names in the parent component.
 */
export default function CollapseControlledExample() {
  const [value, setValue] = useState<string | string[]>('details')

  return (
    <View style={{ gap: 12 }}>
      <Collapse accordion value={value} onChange={(nextValue) => setValue(nextValue as string)}>
        <CollapseItem name="details" title="详细信息">
          <Text>当前由父组件控制。</Text>
        </CollapseItem>
        <CollapseItem name="history" title="历史记录">
          <Text>点击标题会先触发 onChange。</Text>
        </CollapseItem>
      </Collapse>
      <Text type="secondary">当前值：{value}</Text>
    </View>
  )
}
