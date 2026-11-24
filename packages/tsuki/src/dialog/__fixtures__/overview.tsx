import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Confirm from './examples/confirm'
import Controlled from './examples/controlled'
import BeforeClose from './examples/before-close'
import CustomContent from './examples/custom-content'
import RoundButton from './examples/round-button'
import Theme from './examples/theme'
import Imperative from './examples/imperative'
import Multiple from './examples/multiple'

export default function DialogOverview() {
  return (
    <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      <Basic />
      <Confirm />
      <Controlled />
      <BeforeClose />
      <CustomContent />
      <RoundButton />
      <Theme />
      <Imperative />
      <Multiple />
    </ScrollView>
  )
}
