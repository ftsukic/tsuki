import { Navbar } from '../../..'

/**
 * @title Long right action
 * @description Keep a long right action within its reserved side width.
 */
export default function NavbarLongRightActionFixture() {
  return <Navbar title="订单详情" rightText="保存并继续下一步" onPressRight={() => undefined} />
}
