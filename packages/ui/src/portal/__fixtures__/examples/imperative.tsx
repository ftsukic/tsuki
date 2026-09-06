/**
 * @title Portal · imperative
 * @description 展示 Portal 的真实公开 API 和可交互状态。
 */
import { Portal, PortalHost } from '@ftsukic/react-native-ui'
import { Text } from 'react-native'

export default function Example() {
  return (
    <PortalHost>
      <Portal>
        <Text>宿主层内容</Text>
      </Portal>
    </PortalHost>
  )
}
