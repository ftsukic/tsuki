import { StyleSheet, View } from 'react-native'
import {
  Button,
  closeToast,
  ConfigProvider,
  PortalHost,
  showLoadingToast,
  showToast,
} from '@ftsukic/react-native-ui'

/**
 * @title 持续显示与交互
 * @description duration 为 0 时保持显示，可通过实例 close、closeToast、overlay 和 forbidClick 控制生命周期与触摸行为。
 */
export default function ToastInteractionsExample() {
  return (
    <ConfigProvider>
      <PortalHost>
        <View style={styles.container}>
          <Button
            onPress={() => {
              const toast = showLoadingToast({
                duration: 0,
                forbidClick: true,
                message: '请稍候…',
              })
              setTimeout(() => {
                toast.message = '即将完成'
                setTimeout(() => toast.close(), 800)
              }, 1200)
            }}
          >
            loading 实例
          </Button>
          <Button
            onPress={() =>
              showToast({
                closeOnClick: true,
                message: '点击提示即可关闭',
              })
            }
          >
            点击关闭
          </Button>
          <Button
            onPress={() =>
              showToast({
                closeOnClickOverlay: true,
                duration: 0,
                message: '点击遮罩关闭',
                overlay: true,
              })
            }
          >
            遮罩关闭
          </Button>
          <Button onPress={() => closeToast()}>关闭当前</Button>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
