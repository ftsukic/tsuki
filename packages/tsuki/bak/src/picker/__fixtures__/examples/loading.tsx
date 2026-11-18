import { useState } from 'react'
import { Button, Picker } from '@ftsukic/tsuki'
import { View } from 'react-native'

const options = [
  { text: '杭州', value: 'hangzhou' },
  { text: '宁波', value: 'ningbo' },
  { text: '温州', value: 'wenzhou' },
]

/**
 * @title Loading
 * @description Loading 覆盖滚轮内容但保留 Picker 高度和 Toolbar，适合等待异步数据。
 */
export default function PickerLoadingExample() {
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState<typeof options>([])

  const loadOptions = () => {
    setLoading(true)
    setColumns([])
    setTimeout(() => {
      setColumns(options)
      setLoading(false)
    }, 600)
  }

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={loadOptions}>{loading ? '加载中…' : '重新加载'}</Button>
      <Picker columns={columns} defaultValue={['ningbo']} loading={loading} />
    </View>
  )
}
