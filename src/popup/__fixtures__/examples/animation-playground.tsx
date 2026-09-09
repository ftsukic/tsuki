import React, { useEffect, useRef, useState } from 'react'

import { Button, Popup } from '@ftsukic/tsuki'
import { Platform, StyleSheet, Text, View } from 'react-native'

/**
 * @title Animation playground
 * @description 验证 Popup 的打开、关闭、快速反转、销毁和 Android 返回键生命周期。
 */
export default function PopupAnimationPlayground() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>('center')
  const [events, setEvents] = useState<string[]>([])
  const reopenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (reopenTimer.current !== null) clearTimeout(reopenTimer.current)
    },
    [],
  )

  const appendEvent = (event: string) => {
    setEvents((current) => [...current.slice(-3), event])
  }

  const runRapidToggle = () => {
    if (reopenTimer.current !== null) clearTimeout(reopenTimer.current)
    setVisible(false)
    reopenTimer.current = setTimeout(() => setVisible(true), 70)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.platform}>当前平台：{Platform.OS}</Text>
      <View style={styles.row}>
        {(['center', 'top', 'bottom', 'left', 'right'] as const).map((nextPosition) => (
          <Button
            key={nextPosition}
            size="small"
            onPress={() => {
              setPosition(nextPosition)
              setVisible(true)
            }}
          >
            {nextPosition}
          </Button>
        ))}
      </View>
      <View style={styles.row}>
        <Button size="small" onPress={() => setVisible(true)}>
          打开
        </Button>
        <Button size="small" onPress={() => setVisible(false)}>
          关闭
        </Button>
        <Button size="small" onPress={runRapidToggle}>
          快速反转
        </Button>
      </View>
      <Text style={styles.events}>{events.join(' → ') || '等待生命周期事件'}</Text>

      <Popup
        visible={visible}
        position={position}
        closeOnPressOverlay
        destroyOnClosed
        onOpen={() => appendEvent('open')}
        onOpened={() => appendEvent('opened')}
        onClose={() => appendEvent('close')}
        onClosed={() => appendEvent('closed')}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.panel}>
          <Text style={styles.title}>{position} Popup</Text>
          <Text>关闭动画完成后内容会卸载。</Text>
          <Button size="small" onPress={() => setVisible(false)}>
            关闭面板
          </Button>
        </View>
      </Popup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16 },
  events: { color: '#68788d', minHeight: 20 },
  panel: { gap: 16, minWidth: 240, padding: 20 },
  platform: { color: '#1677ff', fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { color: '#1f2937', fontSize: 17, fontWeight: '600' },
})
