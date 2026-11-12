import { Swipe } from '../..'
import { StyleSheet, Text } from 'react-native'

/** @title Loop @description Swipe through the ends continuously. */
export default function Loop() {
  return (
    <Swipe loop style={styles.root}>
      {['1', '2', '3'].map((label) => (
        <Swipe.Item
          key={label}
          style={[
            styles.item,
            { backgroundColor: label === '1' ? '#1989fa' : label === '2' ? '#07c160' : '#ff976a' },
          ]}
        >
          <Text style={styles.text}>{label}</Text>
        </Swipe.Item>
      ))}
    </Swipe>
  )
}
const styles = StyleSheet.create({
  root: { height: 120 },
  item: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24 },
})
