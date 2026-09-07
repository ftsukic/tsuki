import {
  Button,
  ConfigProvider,
  mountPortal,
  PortalHost,
  unmountPortal,
  updatePortal,
} from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { Text, View } from 'react-native'
import type { PortalKey } from '@ftsukic/react-native-ui'

/**
 * @title 命令式挂载
 * @description 使用 PortalKey 更新或卸载由 mountPortal 创建的 entry。
 */
export default function PortalImperativeExample() {
  const [key, setKey] = useState<PortalKey | null>(null)

  const mount = () => {
    if (key !== null) return
    setKey(
      mountPortal(
        <View style={{ backgroundColor: '#fff7e6', padding: 16 }}>
          <Text>命令式 Portal 内容</Text>
        </View>,
      ),
    )
  }

  const update = () => {
    if (key !== null) {
      updatePortal(
        key,
        <View style={{ backgroundColor: '#f6ffed', padding: 16 }}>
          <Text>已更新的 Portal 内容</Text>
        </View>,
      )
    }
  }

  const unmount = () => {
    if (key !== null) {
      unmountPortal(key)
      setKey(null)
    }
  }

  return (
    <ConfigProvider>
      <PortalHost>
        <View style={{ gap: 12 }}>
          <Button onPress={mount} disabled={key !== null}>
            mountPortal
          </Button>
          <Button onPress={update} disabled={key === null}>
            updatePortal
          </Button>
          <Button onPress={unmount} disabled={key === null}>
            unmountPortal
          </Button>
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}
