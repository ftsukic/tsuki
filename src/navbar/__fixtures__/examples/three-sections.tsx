import { Navbar, NavbarAction, Text } from '../../..'

/**
 * @title Three sections
 * @description Keep a custom title centered while left and right actions use independent slots.
 */
export default function NavbarThreeSectionsFixture() {
  return (
    <Navbar
      left={<NavbarAction onPress={() => undefined}>返回</NavbarAction>}
      title={<Text>群组信息</Text>}
      right={<NavbarAction onPress={() => undefined}>更多</NavbarAction>}
    />
  )
}
