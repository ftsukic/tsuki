import { ScrollView } from 'react-native'
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
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Variants />
      <Nested />
      <Cascade />
      <Override />
      <DeepNested />
      <Theme />
      <DarkMode />
    </ScrollView>
  )
}
