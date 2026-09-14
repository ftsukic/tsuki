import { Swipe } from '../..'
import { StyleSheet, Text } from 'react-native'

/** @title Autoplay @description The carousel advances every three seconds. */
export default function Autoplay() {
  return (
    <Swipe autoplay={3000} style={styles.root}>
      {['A', 'B', 'C'].map((label) => (
        <Swipe.Item key={label} style={styles.item}>
          <Text style={styles.text}>{label}</Text>
        </Swipe.Item>
      ))}
    </Swipe>
  )
}
const styles = StyleSheet.create({
  root: { height: 120 },
  item: { backgroundColor: '#7232dd', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24 },
})
