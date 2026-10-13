import { useState } from 'react'
import { Picker, useToken } from '@ftsukic/tsuki'
import type { PickerValue } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

const columns = [
  [],
  [
    { text: '杭州', value: 'hangzhou' },
    { text: '南京', value: 'nanjing' },
  ],
]

/**
 * @title 语义样式与空列
 * @description body 包含整个滚轮；取消和确认可分别定制。第一列为空，后续列的选择值仍可回写。
 */
export default function PickerSemanticExample() {
  const { token } = useToken()
  const [value, setValue] = useState<readonly PickerValue[]>(['hangzhou'])
  const [message, setMessage] = useState('')
  return (
    <View style={{ gap: 12 }}>
      <Picker
        columns={columns}
        columnLabels={['空列', '城市']}
        value={value}
        onChange={setValue}
        onConfirm={(values) => setMessage(`已确认：${values.join(' / ')}`)}
        onCancel={() => setMessage('已取消')}
        title="选择城市"
        styles={{
          body: {
            marginHorizontal: token.margin,
            borderRadius: token.borderRadius,
            overflow: 'hidden',
          },
          toolbar: {
            cancelContent: { color: token.colorTextSecondary },
            confirmContent: { color: token.colorPrimary, fontWeight: '700' },
          },
          itemContent: { letterSpacing: 1 },
        }}
      />
      <Text>当前值：{value.join(' / ')}</Text>
      <Text>{message}</Text>
    </View>
  )
}
