import { Navbar, Text } from '../../..'
import { View } from 'react-native'

/**
 * @title Disabled actions
 * @description Keep both Navbar slots in the layout while disabling their press behavior.
 */
export default function NavbarDisabledActionsFixture() {
  return (
    <View>
      <Navbar
        title="详情"
        leftArrow
        leftText="返回"
        leftDisabled
        onPressLeft={() => undefined}
        rightText="完成"
        rightDisabled
        onPressRight={() => undefined}
      />
      <Text>左右操作仍保留布局，但不会响应点击。</Text>
    </View>
  )
}
