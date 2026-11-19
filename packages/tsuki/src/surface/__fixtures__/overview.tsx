import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Bordered from './examples/bordered'
import CustomClass from './examples/custom-class'
import Inset from './examples/inset'
import Padding from './examples/padding'
import Theme from './examples/theme'
import Overflow from './examples/overflow'

export default function SurfaceOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Overflow />
      <Bordered />
      <Padding />
      <Inset />
      <Theme />
      <CustomClass />
    </ScrollView>
  )
}
