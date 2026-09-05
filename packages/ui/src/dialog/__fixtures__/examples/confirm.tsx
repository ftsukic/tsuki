import { Button, ConfigProvider, PortalHost, showConfirmDialog } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 确认框
 * @description showConfirmDialog 增加取消按钮，确认和取消分别对应 Promise 的 resolve/reject。
 */
export default function DialogConfirmExample() {
  const [result, setResult] = useState('尚未选择')

  return (
    <ConfigProvider>
      <PortalHost>
        <View style={{ gap: 12 }}>
          <Button
            onPress={() => {
              void showConfirmDialog({ title: '删除记录', message: '删除后无法恢复，是否继续？' })
                .then(() => setResult('已确认'))
                .catch(() => setResult('已取消'))
            }}
          >
            显示确认框
          </Button>
          <Text style={{ color: '#68788d' }}>{result}</Text>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}
