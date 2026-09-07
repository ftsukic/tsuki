import React from 'react'

import { Button, Portal } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 组件预览
 */
export default function PortalOverview() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>Portal 内容会渲染到宿主层</Text>
      <Button onPress={() => setVisible((current) => !current)}>
        {visible ? '隐藏 Portal' : '显示 Portal'}
      </Button>
      {visible ? (
        <Portal>
          <View style={styles.portal}>
            <Text style={styles.portalText}>这是 Portal 内容</Text>
          </View>
        </Portal>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 20 },
  caption: { color: '#68788d', fontSize: 14 },
  portal: {
    alignItems: 'center',
    backgroundColor: '#1677ff',
    borderRadius: 8,
    left: 20,
    padding: 12,
    position: 'absolute',
    right: 20,
    top: 100,
  },
  portalText: { color: '#ffffff' },
})
