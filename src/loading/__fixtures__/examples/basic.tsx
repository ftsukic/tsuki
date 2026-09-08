import { Loading } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Basic
 * @description Render the default circular Loading indicator.
 */
export default function LoadingBasicFixture() {
  return (
    <View style={styles.container}>
      <Loading />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    minHeight: 96,
    padding: 24,
  },
})
