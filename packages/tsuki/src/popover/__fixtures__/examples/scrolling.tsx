/**
 * @title ScrollView and arrow options
 * @description Demonstrates FloatingScrollView (UI-thread follow) and dismiss scroll behaviors, auto placement, and configurable arrow visibility.
 */
import { FloatingScrollView, Popover } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

export default function PopoverScrolling() {
  return (
    <FloatingScrollView nestedScrollEnabled style={{ maxHeight: 240 }}>
      <View style={{ gap: 28, padding: 16 }}>
        {Array.from({ length: 5 }, (_, index) => (
          <Text key={index}>Scroll to move anchor ({index + 1})</Text>
        ))}
        <Popover
          closeOnPressOutside={false}
          content="Follows its trigger smoothly while scrolling."
          placement="auto"
          scrollBehavior="follow"
        >
          <Text>Tap, then scroll (follow · auto)</Text>
        </Popover>
        <Popover
          closeOnPressOutside={false}
          content="Closes automatically when scrolling starts."
          placement="bottom"
          scrollBehavior="dismiss"
        >
          <Text>Tap, then scroll (dismiss)</Text>
        </Popover>
        <Popover arrow={false} content="Popover with arrow disabled." placement="bottom">
          <Text>Tap for Popover without arrow</Text>
        </Popover>
        {Array.from({ length: 5 }, (_, index) => (
          <Text key={index}>Scrollable content ({index + 6})</Text>
        ))}
      </View>
    </FloatingScrollView>
  )
}
