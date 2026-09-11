import { Search } from '../../..'
import { Text } from 'react-native'

/**
 * @title Label
 * @description Add a location label after the default search icon.
 */
export default function SearchLabelFixture() {
  return <Search label="地址" placeholder="请输入搜索关键词" action={<Text>搜索</Text>} />
}
