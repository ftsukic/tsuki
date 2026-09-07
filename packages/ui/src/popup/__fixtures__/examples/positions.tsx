import type { PopupPosition } from '@ftsukic/react-native-ui'
import { Button, Popup, Provider } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 五种位置
 * @description position 支持 center、top、bottom、left 和 right，round 会按位置裁剪对应圆角。
 */
export default function PopupPositionsExample() {
  const [position, setPosition] = useState<PopupPosition | null>(null)

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.row}>
          {(['center', 'top', 'bottom', 'left', 'right'] as const).map((item) => (
            <Button key={item} size="small" onPress={() => setPosition(item)}>
              {item}
            </Button>
          ))}
        </View>
        <Popup
          visible={position !== null}
          position={position ?? 'center'}
          round
          closeOnPressOverlay
          onRequestClose={() => setPosition(null)}
        >
          <View style={styles.panel}>
            <Text style={styles.title}>{position} Popup</Text>
            <Button size="small" onPress={() => setPosition(null)}>
              关闭
            </Button>
          </View>
        </Popup>
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  panel: { minWidth: 180, gap: 16, padding: 20 },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
})
