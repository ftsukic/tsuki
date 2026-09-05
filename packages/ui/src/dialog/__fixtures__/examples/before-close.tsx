import { Button, ConfigProvider, PortalHost, showConfirmDialog } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 异步关闭
 * @description beforeClose 可以执行异步检查；返回 false 时保持 Dialog 打开并清除按钮 loading。
 */
export default function DialogBeforeCloseExample() {
  const [result, setResult] = useState('等待操作')

  return (
    <ConfigProvider>
      <PortalHost>
        <View style={{ gap: 12 }}>
          <Button
            onPress={() => {
              void showConfirmDialog({
                message: '确认后会先执行异步检查。',
                beforeClose: async (action) => {
                  await new Promise((resolve) => setTimeout(resolve, 600))
                  if (action === 'cancel') return false
                  setResult('检查通过，已确认')
                  return true
                },
              }).catch(() => setResult('取消被拦截'))
            }}
          >
            异步确认
          </Button>
          <Text style={{ color: '#68788d' }}>{result}</Text>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}
