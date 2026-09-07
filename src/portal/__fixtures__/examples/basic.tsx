import React from 'react'

import { Button, Portal } from '@ftsukic/tsuki'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 组件式 Portal
 * @description Portal 会将内容渲染到 PortalHost 的宿主层。
 */
export default function PortalBasicExample() {
  const [show, setShow] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setShow((current) => !current)}>切换 Portal</Button>
      {show ? (
        <Portal>
          <View style={{ backgroundColor: '#f0f5ff', padding: 16 }}>
            <Text>脱离页面布局渲染的内容</Text>
          </View>
        </Portal>
      ) : null}
    </View>
  )
}
