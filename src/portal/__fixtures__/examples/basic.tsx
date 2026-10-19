import React from 'react'

import { Button } from '@ftsukic/tsuki'
import { TeleportPortal as Portal } from '../../teleport-portal'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 组件式 Portal
 * @description Teleport Portal 将内容渲染到 PortalProvider 提供的 root 宿主。
 */
export default function PortalBasicExample() {
  const [show, setShow] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setShow((current) => !current)}>切换 Portal</Button>
      {show ? (
        <Portal hostName="root">
          <View style={{ backgroundColor: '#f0f5ff', padding: 16 }}>
            <Text>脱离页面布局渲染的内容</Text>
          </View>
        </Portal>
      ) : null}
    </View>
  )
}
