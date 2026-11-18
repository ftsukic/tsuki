import { Search } from '../../..'
import { Text } from 'react-native'

/**
 * @title Action
 * @description Put a custom cancel action outside the input area.
 */
export default function SearchActionFixture() {
  return <Search placeholder="请输入搜索关键词" action={<Text>取消</Text>} />
}
