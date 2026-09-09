import { Progress } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Line without pivot
 * @description Hide the percentage pivot while keeping the animated line progress.
 */
export default function ProgressLineWithoutPivotExample() {
  return (
    <View style={styles.container}>
      <Progress percentage={60} showPivot={false} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    minHeight: 96,
    padding: 24,
  },
})
