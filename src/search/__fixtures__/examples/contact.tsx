import { Navbar, Search } from '../../..'
import { View } from 'react-native'

/**
 * @title Contact search
 * @description Combine Navbar and Search for a contact-search entry.
 */
export default function SearchContactFixture() {
  return (
    <View>
      <Navbar title="浙江万安科技股份有限公司" leftArrow={false} />
      <Search placeholder="搜索联系人姓名/工号" />
    </View>
  )
}
