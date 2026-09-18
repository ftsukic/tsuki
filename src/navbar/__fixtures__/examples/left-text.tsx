import { Navbar } from '../../..'

/**
 * @title Left text
 * @description Add return text beside the default back arrow.
 */
export default function NavbarLeftTextFixture() {
  return <Navbar title="详情" leftArrow leftText="返回" onPressLeft={() => undefined} />
}
