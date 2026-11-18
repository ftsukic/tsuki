/**
 * @title Text
 * @description Text variants, composition and theme scopes.
 */
import Basic from './examples/basic'
import Variants from './examples/variants'
import Nested from './examples/nested'
import Cascade from './examples/cascade'
import Override from './examples/override'
import DeepNested from './examples/deep-nested'
import Theme from './examples/theme'
import DarkMode from './examples/dark-mode'

export default function TextOverview() {
  return (
    <>
      <Basic />
      <Variants />
      <Nested />
      <Cascade />
      <Override />
      <DeepNested />
      <Theme />
      <DarkMode />
    </>
  )
}
