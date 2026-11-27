/**
 * @title ScrollView anchor
 * @description Uses FloatingScrollView (UI-thread scroll tracking) so Tooltip can follow smoothly without jitter or dismiss on scroll.
 */
import { FloatingScrollView, Tooltip } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

export default function TooltipScrolling() {
  return (
    <FloatingScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
      <View style={{ gap: 28, padding: 16 }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Text key={index}>Scroll to move this anchor ({index + 1})</Text>
        ))}
        <Tooltip
          content="This hint follows its trigger smoothly while scrolling."
          placement="top"
          scrollBehavior="follow"
          trigger="press"
        >
          <Text>Tap, then scroll (follow)</Text>
        </Tooltip>
        <Tooltip
          content="This hint closes automatically when scrolling starts."
          placement="bottom"
          scrollBehavior="dismiss"
          trigger="press"
        >
          <Text>Tap, then scroll (dismiss)</Text>
        </Tooltip>
        {Array.from({ length: 6 }, (_, index) => (
          <Text key={index}>Scrollable content ({index + 7})</Text>
        ))}
      </View>
    </FloatingScrollView>
  )
}
