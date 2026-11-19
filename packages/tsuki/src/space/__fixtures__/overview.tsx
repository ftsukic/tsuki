import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import CustomClass from './examples/custom-class'
import Vertical from './examples/vertical'
import Wrap from './examples/wrap'
import Alignment from './examples/align'

export default function SpaceOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Alignment />
      <Vertical />
      <Wrap />
      <CustomClass />
    </ScrollView>
  )
}
