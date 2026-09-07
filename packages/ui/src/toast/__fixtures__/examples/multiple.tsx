import { StyleSheet, View } from 'react-native'
import {
  Button,
  allowMultipleToast,
  closeToast,
  ConfigProvider,
  PortalHost,
  showFailToast,
  showSuccessToast,
} from '@ftsukic/react-native-ui'

/**
 * @title 单例与多实例
 * @description 默认新提示会更新当前实例，开启 allowMultipleToast 后可以同时展示多个提示。
 */
export default function ToastMultipleExample() {
  return (
    <ConfigProvider>
      <PortalHost>
        <View style={styles.container}>
          <Button onPress={() => allowMultipleToast(false)}>使用单例</Button>
          <Button onPress={() => allowMultipleToast(true)}>允许多实例</Button>
          <Button onPress={() => showSuccessToast({ duration: 0, message: '第一个提示' })}>
            创建成功提示
          </Button>
          <Button onPress={() => showFailToast({ duration: 0, message: '第二个提示' })}>
            创建失败提示
          </Button>
          <Button onPress={() => closeToast(true)}>关闭全部</Button>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
