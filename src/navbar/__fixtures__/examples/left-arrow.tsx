import { Navbar } from '../../..'

/**
 * @title Left arrow
 * @description Use the default Vant-style left arrow action.
 */
export default function NavbarLeftArrowFixture() {
  return <Navbar title="返回" onPressLeft={() => undefined} />
}
