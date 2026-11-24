import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Placements from './examples/placements'
import Scrolling from './examples/scrolling'
import Theme from './examples/theme'

export default function TooltipOverview() {
  return (
    <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      <Basic />
      <Placements />
      <Scrolling />
      <Theme />
    </ScrollView>
  )
}
