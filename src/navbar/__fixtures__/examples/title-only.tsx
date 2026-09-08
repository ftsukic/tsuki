import { Navbar } from '../../..'

/**
 * @title Title only
 * @description Render a title without a left or right action.
 */
export default function NavbarTitleOnlyFixture() {
  return <Navbar leftArrow={false} title="仅标题" />
}
