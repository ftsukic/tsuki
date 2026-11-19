import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Accessories from './examples/accessories'
import SemanticClasses from './examples/semantic-classes'
import Disabled from './examples/disabled'
import Password from './examples/password'
import Theme from './examples/theme'

export default function InputOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Disabled />
      <Password />
      <Theme />
      <Accessories />
      <SemanticClasses />
    </ScrollView>
  )
}
