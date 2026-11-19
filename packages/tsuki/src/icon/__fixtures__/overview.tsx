import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Sizes from './examples/sizes'
import Colors from './examples/colors'
import TwoTone from './examples/two-tone'
import Custom from './examples/custom'
import Interactive from './examples/interactive'

export default function IconOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Sizes />
      <Colors />
      <TwoTone />
      <Custom />
      <Interactive />
    </ScrollView>
  )
}
