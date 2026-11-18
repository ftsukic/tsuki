import { Progress } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Line variants
 * @description Compare common line values, colors, and stroke linecaps.
 */
export default function ProgressLineVariantsExample() {
  return (
    <View style={styles.container}>
      <Progress percentage={50} />
      <Progress color="#07C160" percentage={100} trackColor="#E8F5E9" />
      <Progress color="#7232DD" percentage={72} strokeLinecap="round" />
      <Progress color="#FF976A" percentage={72} strokeLinecap="square" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    justifyContent: 'center',
    minHeight: 140,
    padding: 24,
  },
})
