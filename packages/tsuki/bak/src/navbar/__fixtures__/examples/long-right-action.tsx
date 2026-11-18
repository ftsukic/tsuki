import { Navbar } from '../../..'

/**
 * @title Long right action
 * @description Render a long right action with the default single-line text behavior.
 */
export default function NavbarLongRightActionFixture() {
  return <Navbar title="订单详情" rightText="保存并继续下一步" onPressRight={() => undefined} />
}
