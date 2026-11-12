import { Swipe } from '../..'
import { StyleSheet, Text } from 'react-native'

/** @title Basic swipe @description Three slides with the default indicator. */
export default function Basic() {
  return (
    <Swipe indicatorColor="#fff" style={styles.root}>
      {['#1989fa', '#07c160', '#ff976a'].map((color, index) => (
        <Swipe.Item key={color} style={[styles.item, { backgroundColor: color }]}>
          <Text style={styles.text}>{index + 1}</Text>
        </Swipe.Item>
      ))}
    </Swipe>
  )
}
const styles = StyleSheet.create({
  root: { height: 160 },
  item: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 28 },
})
