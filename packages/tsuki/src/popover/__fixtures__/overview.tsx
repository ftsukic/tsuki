import { FloatingScrollView } from '@ftsukic/tsuki'
import Basic from './examples/basic'
import Interactive from './examples/interactive'
import Placements from './examples/placements'
import Scrolling from './examples/scrolling'
import Theme from './examples/theme'

export default function PopoverOverview() {
  return (
    <FloatingScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      <Basic />
      <Interactive />
      <Placements />
      <Scrolling />
      <Theme />
    </FloatingScrollView>
  )
}
