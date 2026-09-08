import { Button, Popup } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Bottom safe area
 * @description Add the host-provided bottom safe-area inset to a bottom Popup.
 */
export default function PopupSafeAreaExample() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>显示底部 Popup</Button>
      <Popup
        visible={visible}
        position="bottom"
        round
        safeAreaInsetBottom
        closeOnPressOverlay
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.panel}>
          <Text style={styles.title}>底部安全区由 Popup 统一处理</Text>
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
  panel: { gap: 16, padding: 20 },
  title: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
})
