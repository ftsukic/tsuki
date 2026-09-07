import { Button, ConfigProvider, PortalHost, showDialog } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

/**
 * @title 基础提示
 * @description showDialog 默认展示一个确认按钮，Promise 在确认后 resolve。
 */
export default function DialogBasicExample() {
  return (
    <ConfigProvider>
      <PortalHost>
        <View style={{ gap: 12 }}>
          <Button
            onPress={() => {
              void showDialog({ title: '提示', message: '这是一条需要确认的消息。' })
            }}
          >
            显示提示
          </Button>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}
