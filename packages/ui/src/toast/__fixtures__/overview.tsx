import { StyleSheet, Text, View } from 'react-native'
import {
  Button,
  ConfigProvider,
  PortalHost,
  showFailToast,
  showSuccessToast,
  showToast,
} from '../..'

/**
 * @title 组件预览
 */
export default function ToastOverview() {
  return (
    <ConfigProvider>
      <PortalHost>
        <View style={styles.container}>
          <Text style={styles.caption}>基础类型</Text>
          <View style={styles.row}>
            <Button onPress={() => showToast('普通提示')}>普通提示</Button>
            <Button type="success" onPress={() => showSuccessToast('操作成功')}>
              成功
            </Button>
            <Button type="danger" onPress={() => showFailToast('操作失败')}>
              失败
            </Button>
          </View>
          <Text style={styles.caption}>持续提示</Text>
          <Button
            onPress={() =>
              showToast({
                duration: 0,
                message: '持续显示，点击其他按钮关闭',
              })
            }
          >
            持续显示
          </Button>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 20 },
  caption: { color: '#68788d', fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
})
