import { Swipe } from '../..'
import { StyleSheet, Text } from 'react-native'

/** @title Custom indicator @description Replace the default dots with a counter. */
export default function CustomIndicator() {
  return (
    <Swipe
      style={styles.root}
      renderIndicator={({ activeIndex, total }) => (
        <Text style={styles.indicator}>
          {activeIndex + 1} / {total}
        </Text>
      )}
    >
      {['A', 'B', 'C', 'D'].map((label) => (
        <Swipe.Item key={label} style={styles.item}>
          <Text style={styles.text}>{label}</Text>
        </Swipe.Item>
      ))}
    </Swipe>
  )
}
const styles = StyleSheet.create({
  root: { height: 120 },
  item: { backgroundColor: '#1989fa', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24 },
  indicator: { position: 'absolute', right: 12, bottom: 12, color: '#fff' },
})
