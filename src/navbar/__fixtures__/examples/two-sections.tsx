import { Badge, Flex, Icon, Navbar, Pressable, Text, showDialog, showToast } from '../../..'
import { View } from 'react-native'

/**
 * @title Two sections
 * @description Use multiple independent Pressable instances inside custom slots; do not also pass slot-level callbacks.
 */
export default function NavbarTwoSectionsFixture() {
  return (
    <Navbar
      left={
        <Pressable onPress={() => undefined}>
          <Icon name="LeftOutlined" size={18}></Icon>
        </Pressable>
      }
      title={
        <View>
          <Text style={{ fontSize: 18, fontWeight: '500' }}>绘梨衣</Text>
          <Badge status="default" text="离线" color="#666"></Badge>
        </View>
      }
      right={
        <Flex gap={8}>
          <Pressable onPress={() => showDialog({ title: '添加' })}>
            <Icon name="PlusOutlined" size={18} />
          </Pressable>
          <Pressable onPress={() => showToast('更多')}>
            <Icon name="EllipsisOutlined" size={18} />
          </Pressable>
        </Flex>
      }
      styles={{ title: { marginLeft: '12%' } }}
    />
  )
}
