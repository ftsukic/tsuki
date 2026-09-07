import { StyleSheet, View } from 'react-native'
import { Button, ConfigProvider, PortalHost, showToast } from '@ftsukic/react-native-ui'

/**
 * @title 位置
 * @description 使用 position 将提示放在顶部、中间或底部。
 */
export default function ToastPositionsExample() {
  return (
    <ConfigProvider>
      <PortalHost>
        <View style={styles.container}>
          <Button onPress={() => showToast({ message: '顶部提示', position: 'top' })}>top</Button>
          <Button onPress={() => showToast({ message: '中间提示', position: 'middle' })}>
            middle
          </Button>
          <Button onPress={() => showToast({ message: '底部提示', position: 'bottom' })}>
            bottom
          </Button>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
