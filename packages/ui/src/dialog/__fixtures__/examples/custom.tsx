import { Button, ConfigProvider, Dialog, PortalHost } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 自定义内容
 * @description children 替换 message，footer 替换默认按钮区域，title 也支持 ReactNode。
 */
export default function DialogCustomExample() {
  const [show, setShow] = useState(false)

  return (
    <ConfigProvider>
      <PortalHost>
        <View style={{ gap: 12 }}>
          <Button onPress={() => setShow(true)}>打开自定义 Dialog</Button>
          <Dialog
            show={show}
            title={<Text style={{ color: '#1677ff' }}>自定义标题</Text>}
            footer={
              <Button block onPress={() => setShow(false)}>
                知道了
              </Button>
            }
            onShowChange={setShow}
          >
            <Text style={{ color: '#34495e', lineHeight: 24 }}>
              Dialog 的正文可以直接嵌入任意 React Native 内容。
            </Text>
          </Dialog>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}
