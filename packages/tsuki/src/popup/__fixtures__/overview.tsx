import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Positions from './examples/positions'
import Controlled from './examples/controlled'
import Overlay from './examples/overlay'
import Round from './examples/round'
import SafeArea from './examples/safe-area'
import Keyboard from './examples/keyboard'
import ScrollContent from './examples/scroll-content'
import Theme from './examples/theme'
import NestedOverlay from './examples/nested-overlay'

export default function PopupOverview() {
  return (
    <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      <Basic />
      <Positions />
      <Controlled />
      <Overlay />
      <Round />
      <SafeArea />
      <Keyboard />
      <ScrollContent />
      <Theme />
      <NestedOverlay />
    </ScrollView>
  )
}
