import { Loading } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Vertical
 * @description Stack the indicator above its loading message.
 */
export default function LoadingVerticalFixture() {
  return (
    <View style={styles.container}>
      <Loading color="#7232DD" vertical>
        正在同步
      </Loading>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    minHeight: 128,
    padding: 24,
  },
})
