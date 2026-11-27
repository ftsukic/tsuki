import { FloatingScrollView } from '@ftsukic/tsuki'
import Basic from './examples/basic'
import Placements from './examples/placements'
import Scrolling from './examples/scrolling'
import Theme from './examples/theme'

export default function TooltipOverview() {
  return (
    <FloatingScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      <Basic />
      <Placements />
      <Scrolling />
      <Theme />
    </FloatingScrollView>
  )
}
