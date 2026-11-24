import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Interactive from './examples/interactive'
import Placements from './examples/placements'
import Theme from './examples/theme'

export default function PopoverOverview() {
  return (
    <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      <Basic />
      <Interactive />
      <Placements />
      <Theme />
    </ScrollView>
  )
}
