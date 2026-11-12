import { Progress } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Custom text
 * @description Use custom pivot text for both line and circle progress.
 */
export default function ProgressCustomTextExample() {
  return (
    <View style={styles.container}>
      <Progress percentage={68} pivotText="同步中" />
      <Progress percentage={68} pivotText="完成" type="circle" />
      <Progress size={16} strokeWidth={2} percentage={68} showPivot={false} type="circle" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 28,
    justifyContent: 'center',
    minHeight: 144,
    padding: 24,
  },
})
