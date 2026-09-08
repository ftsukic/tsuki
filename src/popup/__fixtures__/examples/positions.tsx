import React from 'react'

import type { PopupPosition } from '@ftsukic/tsuki'
import { Button, Popup } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 五种位置
 * @description position 支持 center、top、bottom、left 和 right，round 会按位置裁剪对应圆角。
 */
export default function PopupPositionsExample() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<PopupPosition>('center')

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {(['center', 'top', 'bottom', 'left', 'right'] as const).map((item) => (
          <Button
            key={item}
            size="small"
            onPress={() => {
              setPosition(item)
              setVisible(true)
            }}
          >
            {item}
          </Button>
        ))}
      </View>
      <Popup
        visible={visible}
        position={position}
        round
        closeOnPressOverlay
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.panel}>
          <Text style={styles.title}>{position} Popup</Text>
          <Button size="small" onPress={() => setVisible(false)}>
            关闭
          </Button>
        </View>
      </Popup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  panel: { minWidth: 180, gap: 16, padding: 20 },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
})
