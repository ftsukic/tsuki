import { Loading } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Type
 * @description Compare the circular gap ring with the radial spinner bars.
 */
export default function LoadingTypeFixture() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Loading type="circular" />
        <Text style={styles.label}>Circular</Text>
      </View>
      <View style={styles.item}>
        <Loading type="spinner" />
        <Text style={styles.label}>Spinner</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    gap: 40,
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
