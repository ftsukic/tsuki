import { Navbar } from '../../..'

/**
 * @title Long left text
 * @description Keep a long left action within its reserved side width.
 */
export default function NavbarLongLeftTextFixture() {
  return <Navbar title="订单详情" leftText="返回订单列表并继续浏览" onPressLeft={() => undefined} />
}
