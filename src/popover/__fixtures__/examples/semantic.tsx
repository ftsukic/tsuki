import { Button, Popover } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Semantic styles
 * @description Customize the Popover reference, content and action slots.
 */
export default function PopoverSemanticFixture() {
  return (
    <View style={styles.container}>
      <Popover
        actions={[{ text: '强调操作' }, { text: '次要操作' }]}
        styles={({ state }) => ({
          action: { minHeight: state.visible ? 50 : 44 },
          actionText: { fontWeight: '600' },
          content: { borderColor: '#1989fa', borderWidth: 1 },
          reference: { opacity: state.visible ? 1 : 0.82 },
        })}
      >
        <Button>语义样式</Button>
      </Popover>
      <Text style={styles.caption}>reference、content、action 和 actionText 可独立定制。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  caption: {
    color: '#667085',
    fontSize: 13,
  },
  container: {
    gap: 10,
  },
})
