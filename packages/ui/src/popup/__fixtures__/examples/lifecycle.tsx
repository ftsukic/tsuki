/**
 * @title Popup · lifecycle
 * @description 展示 Popup 的真实公开 API 和可交互状态。
 */
import { Popup, UIProvider } from '@ftsukic/react-native-ui'
import { Text } from 'react-native'

export default function Example() {
  return (
    <UIProvider>
      <Popup visible position="bottom" round>
        <Text style={{ padding: 24 }}>弹层内容</Text>
      </Popup>
    </UIProvider>
  )
}
