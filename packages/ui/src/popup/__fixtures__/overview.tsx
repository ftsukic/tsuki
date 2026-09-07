import { Button, Popup, Provider } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 组件预览
 */
export default function PopupOverview() {
  const [visible, setVisible] = useState(false)

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.caption}>居中弹层</Text>
        <Button onPress={() => setVisible(true)}>显示 Popup</Button>
        <Popup visible={visible} round closeOnPressOverlay onRequestClose={() => setVisible(false)}>
          <View style={styles.card}>
            <Text style={styles.title}>Popup 内容</Text>
            <Text style={styles.description}>点击遮罩或按钮关闭弹层。</Text>
            <Button onPress={() => setVisible(false)}>关闭</Button>
          </View>
        </Popup>
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 20 },
  card: { width: 260, gap: 16, padding: 20 },
  caption: { color: '#68788d', fontSize: 14 },
  description: { color: '#68788d', lineHeight: 22 },
  title: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
})
