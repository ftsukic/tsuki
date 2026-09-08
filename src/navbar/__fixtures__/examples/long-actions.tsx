import { Navbar } from '../../..'

/**
 * @title Long actions
 * @description Keep the title centered when both side actions contain long text.
 */
export default function NavbarLongActionsFixture() {
  return (
    <Navbar
      title="订单详情"
      leftText="返回上一级"
      onPressLeft={() => undefined}
      rightText="保存并继续"
      onPressRight={() => undefined}
    />
  )
}
