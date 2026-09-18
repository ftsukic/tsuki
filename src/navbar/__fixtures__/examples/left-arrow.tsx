import { Navbar } from '../../..'

/**
 * @title Left arrow
 * @description Use the default Vant-style left arrow action with a custom icon size.
 */
export default function NavbarLeftArrowFixture() {
  return <Navbar title="返回" leftArrow onPressLeft={() => undefined} />
}
