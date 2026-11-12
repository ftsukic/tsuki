import { Button, Icon, Search } from '../../..'
import { View } from 'react-native'

/**
 * @title Action extra
 * @description Compose multiple nodes in the external action region.
 */
export default function SearchActionExtraFixture() {
  return (
    <Search
      placeholder="请输入搜索关键词"
      action={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Button size="small">搜索</Button>
          <Icon name="SettingOutlined" />
        </View>
      }
    />
  )
}
