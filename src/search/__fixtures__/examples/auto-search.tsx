import { Search } from '../../..'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title Auto search
 * @description Trigger the latest search after a short debounce.
 */
export default function SearchAutoSearchFixture() {
  const [result, setResult] = useState('')

  return (
    <View style={{ gap: 8 }}>
      <Search autoSearch debounce={300} placeholder="输入关键词自动搜索" onSearch={setResult} />
      <Text>最近搜索：{result || '—'}</Text>
    </View>
  )
}
