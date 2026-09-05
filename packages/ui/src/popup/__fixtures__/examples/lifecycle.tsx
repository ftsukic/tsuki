import { Button, Popup, Provider } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 生命周期与销毁
 * @description lazyRender 延迟首次渲染，destroyOnClosed 在关闭动画完成后卸载内容。
 */
export default function PopupLifecycleExample() {
  const [visible, setVisible] = useState(false)
  const [events, setEvents] = useState<string[]>([])

  const appendEvent = (event: string) => setEvents((current) => [...current.slice(-3), event])

  return (
    <Provider>
      <View style={styles.container}>
        <Button onPress={() => setVisible(true)}>显示并记录生命周期</Button>
        <Text style={styles.caption}>{events.join(' → ') || '等待操作'}</Text>
        <Popup
          visible={visible}
          destroyOnClosed
          onOpen={() => appendEvent('open')}
          onOpened={() => appendEvent('opened')}
          onClose={() => appendEvent('close')}
          onClosed={() => appendEvent('closed')}
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.panel}>
            <Text>关闭后内容会被销毁，下次打开重新挂载。</Text>
            <Button onPress={() => setVisible(false)}>关闭</Button>
          </View>
        </Popup>
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  caption: { color: '#68788d', fontSize: 13, minHeight: 20 },
  panel: { width: 260, gap: 16, padding: 20 },
})
