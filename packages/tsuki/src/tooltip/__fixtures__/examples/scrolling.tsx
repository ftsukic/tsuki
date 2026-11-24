/**
 * @title ScrollView anchor
 * @description Sends the scroll offset as repositionKey so a stationary trigger is remeasured while scrolling.
 */
import { Tooltip } from '@ftsukic/tsuki'
import { ScrollView, Text, View } from 'react-native'
import { useState } from 'react'

export default function TooltipScrolling() {
  const [scrollOffset, setScrollOffset] = useState(0)

  return (
    <ScrollView
      nestedScrollEnabled
      onScroll={(event) => setScrollOffset(event.nativeEvent.contentOffset.y)}
      scrollEventThrottle={32}
      style={{ maxHeight: 220 }}
    >
      <View style={{ gap: 28, padding: 16 }}>
        {Array.from({ length: 8 }, (_, index) => (
          <Text key={index}>Scroll to move this anchor ({index + 1})</Text>
        ))}
        <Tooltip
          content="This hint follows its trigger as the list moves."
          placement="top"
          repositionKey={scrollOffset}
          trigger="press"
        >
          <Text>Tap, then scroll to reposition</Text>
        </Tooltip>
        {Array.from({ length: 8 }, (_, index) => (
          <Text key={index}>Scrollable content ({index + 9})</Text>
        ))}
      </View>
    </ScrollView>
  )
}
