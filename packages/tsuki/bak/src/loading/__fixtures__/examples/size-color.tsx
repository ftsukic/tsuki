import { Loading } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Size and color
 * @description Customize the shared indicator size and color for either type.
 */
export default function LoadingSizeColorFixture() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Loading color="#1989FA" size={18} />
        <Text style={styles.label}>18</Text>
      </View>
      <View style={styles.item}>
        <Loading color="#07C160" size={28} type="spinner" />
        <Text style={styles.label}>28</Text>
      </View>
      <View style={styles.item}>
        <Loading color="#EE0A24" size={38} />
        <Text style={styles.label}>38</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'center',
    minHeight: 120,
    padding: 24,
  },
  item: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#667085',
    fontSize: 13,
  },
})
