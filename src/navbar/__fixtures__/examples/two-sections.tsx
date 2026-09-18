import { Navbar, NavbarAction, Text, Badge, Icon, showToast, showDialog } from '../../..'
import { View } from 'react-native'

/**
 * @title Two sections
 * @description Use multiple independent NavbarAction instances inside custom slots; do not also pass slot-level callbacks.
 */
export default function NavbarTwoSectionsFixture() {
  return (
    <Navbar
      title="群组信息"
      left={
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <NavbarAction onPress={() => undefined}>返回</NavbarAction>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 500 }}>绘梨衣</Text>
            <Badge status="default" text="离线" color="#666"></Badge>
          </View>
        </View>
      }
      right={
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <NavbarAction
            style={{ paddingHorizontal: 8 }}
            onPress={() => showDialog({ title: '添加' })}
          >
            <Icon name="PlusOutlined" size={18} />
          </NavbarAction>
          <NavbarAction
            style={{ paddingRight: 16, paddingLeft: 4 }}
            onPress={() => showToast('更多')}
          >
            <Icon name="EllipsisOutlined" size={18} />
          </NavbarAction>
        </View>
      }
    />
  )
}
