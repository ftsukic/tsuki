import { Loading } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Text
 * @description Place a loading message beside the indicator.
 */
export default function LoadingTextFixture() {
  return (
    <View style={styles.container}>
      <Loading color="#1989FA" textColor="#344054" textSize={14}>
        正在加载
      </Loading>
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
