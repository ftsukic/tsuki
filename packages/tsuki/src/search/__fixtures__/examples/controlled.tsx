import { useState } from 'react'
import { Search } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Controlled
 * @description Keep the search keyword in the page state.
 */
export default function SearchControlledFixture() {
  const [value, setValue] = useState('')

  return (
    <View style={{ gap: 8 }}>
      <Search value={value} placeholder="搜索联系人" onChange={setValue} />
      <Text>当前关键词：{value || '—'}</Text>
    </View>
  )
}
