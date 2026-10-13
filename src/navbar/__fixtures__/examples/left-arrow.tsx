import { Navbar } from '../../..'

/**
 * @title Left arrow
 * @description Use the default left arrow and text color, or customize them together.
 */
export default function NavbarLeftArrowFixture() {
  return <Navbar title="返回" leftArrow leftText="返回" onPressLeft={() => undefined} />
}
