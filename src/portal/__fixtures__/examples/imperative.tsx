import React from 'react'

import { Button, mountPortal, unmountPortal, updatePortal } from '@ftsukic/tsuki'
import { useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import type { PortalKey } from '@ftsukic/tsuki'

/**
 * @title 命令式挂载
 * @description 使用 PortalKey 更新或卸载由 mountPortal 创建的 entry。
 */
export default function PortalImperativeExample() {
  const [key, setKey] = useState<PortalKey | null>(null)
  const keyRef = useRef<PortalKey | null>(null)

  useEffect(
    () => () => {
      if (keyRef.current !== null) unmountPortal(keyRef.current)
      keyRef.current = null
    },
    [],
  )

  const mount = () => {
    if (keyRef.current !== null) return
    const nextKey = mountPortal(
      <View style={{ backgroundColor: '#fff7e6', padding: 16 }}>
        <Text>命令式 Portal 内容</Text>
      </View>,
    )
    keyRef.current = nextKey
    setKey(nextKey)
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
      keyRef.current = null
      setKey(null)
    }
  }

  return (
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
  )
}
