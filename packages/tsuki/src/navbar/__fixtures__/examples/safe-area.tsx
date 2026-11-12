import { Navbar } from '../../..'

/**
 * @title Safe area
 * @description Add the top safe-area inset before the 46-point Navbar content area.
 */
export default function NavbarSafeAreaFixture() {
  return <Navbar title="安全区导航栏" safeAreaInsetTop />
}
