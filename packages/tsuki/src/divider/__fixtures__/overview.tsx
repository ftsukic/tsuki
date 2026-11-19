import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import CustomClass from './examples/custom-class'
import Options from './examples/options'
import Orientation from './examples/orientation'
import Theme from './examples/theme'

export default function DividerOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Orientation />
      <Options />
      <Theme />
      <CustomClass />
    </ScrollView>
  )
}
