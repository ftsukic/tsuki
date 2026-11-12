import { Progress } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Default line
 * @description Render a 60% line progress with the default token values.
 */
export default function ProgressBasicExample() {
  return (
    <View style={styles.container}>
      <Progress percentage={60} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    justifyContent: 'center',
    minHeight: 96,
    padding: 24,
  },
})
