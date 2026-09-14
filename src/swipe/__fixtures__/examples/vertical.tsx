import { Swipe } from '../..'
import { StyleSheet, Text } from 'react-native'

/** @title Vertical @description A fixed-height vertical carousel. */
export default function Vertical() {
  return (
    <Swipe vertical height={120} style={styles.root}>
      {['上', '中', '下'].map((label) => (
        <Swipe.Item key={label} style={styles.item}>
          <Text style={styles.text}>{label}</Text>
        </Swipe.Item>
      ))}
    </Swipe>
  )
}
const styles = StyleSheet.create({
  root: { height: 120 },
  item: { backgroundColor: '#323233', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24 },
})
