import { Segmented, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Filter example
 * @description Compare content-sized and block Segmented controls across sizes.
 */
export default function FilterSegmentedExample() {
  const [value, setValue] = useState<string | number>('全部')

  return (
    <View style={{ gap: 16 }}>
      <Segmented
        value={value}
        onChange={setValue}
        options={['全部', '待处理', '已完成']}
        size="small"
      />
      <Segmented
        block
        value={value}
        onChange={setValue}
        options={[
          { label: '全部', value: '全部' },
          { label: '待处理', value: '待处理' },
          { label: '已完成', value: '已完成' },
        ]}
        size="large"
      />
      <Text type="secondary">筛选：{String(value)}</Text>
    </View>
  )
}
