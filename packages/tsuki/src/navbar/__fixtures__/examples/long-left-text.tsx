import { Navbar } from '../../..'

/**
 * @title Long left text
 * @description Render a long left action with the default single-line text behavior.
 */
export default function NavbarLongLeftTextFixture() {
  return <Navbar title="订单详情" leftText="返回订单列表并继续浏览" onPressLeft={() => undefined} />
}
