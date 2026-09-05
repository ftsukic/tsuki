import { StyleSheet, View } from 'react-native'
import {
  Button,
  ConfigProvider,
  PortalHost,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
} from '@ftsukic/react-native-ui'

/**
 * @title 基础类型
 * @description Toast 支持 text、loading、success 和 fail 四种原生提示类型。
 */
export default function ToastBasicExample() {
  return (
    <ConfigProvider>
      <PortalHost>
        <View style={styles.container}>
          <Button onPress={() => showToast('普通提示')}>text</Button>
          <Button onPress={() => showLoadingToast({ message: '加载中', duration: 0 })}>
            loading
          </Button>
          <Button type="success" onPress={() => showSuccessToast('保存成功')}>
            success
          </Button>
          <Button type="danger" onPress={() => showFailToast('保存失败')}>
            fail
          </Button>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
