import { Progress } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Circle
 * @description Render the default circle alongside custom sizes and stroke widths.
 */
export default function ProgressCircleExample() {
  return (
    <View style={styles.container}>
      <Progress percentage={60} type="circle" />
      <Progress percentage={40} size={64} strokeWidth={8} type="circle" />
      <Progress color="#7232DD" percentage={82} size={96} strokeWidth={6} type="circle" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
    minHeight: 144,
    padding: 24,
  },
})
