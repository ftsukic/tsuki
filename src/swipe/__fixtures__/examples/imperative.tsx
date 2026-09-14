import { Swipe } from '../..'
import { useRef } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import type { SwipeRef } from '../../types'

/** @title Imperative navigation @description Use a ref to move between slides. */
export default function Imperative() {
  const ref = useRef<SwipeRef>(null)
  return (
    <View style={styles.container}>
      <Swipe ref={ref} style={styles.root}>
        {['0', '1', '2'].map((label) => (
          <Swipe.Item key={label} style={styles.item}>
            <Text style={styles.text}>{label}</Text>
          </Swipe.Item>
        ))}
      </Swipe>
      <View style={styles.buttons}>
        <Button title="Prev" onPress={() => ref.current?.prev()} />
        <Button title="Next" onPress={() => ref.current?.next()} />
        <Button title="Go 0" onPress={() => ref.current?.swipeTo(0)} />
        <Button title="Go 2 now" onPress={() => ref.current?.swipeTo(2, { immediate: true })} />
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { gap: 12 },
  root: { height: 100 },
  item: { backgroundColor: '#07c160', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
})
