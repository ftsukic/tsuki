import { Button, ConfigProvider, Dialog, PortalHost } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 组件预览
 */
export default function DialogOverview() {
  const [show, setShow] = useState(false)

  return (
    <ConfigProvider>
      <PortalHost>
        <View style={styles.container}>
          <Text style={styles.caption}>受控 Dialog</Text>
          <Button onPress={() => setShow(true)}>打开 Dialog</Button>
          <Dialog
            show={show}
            title="操作确认"
            message="这是一个受控 Dialog 示例。"
            showCancelButton
            onShowChange={setShow}
          />
        </View>
      </PortalHost>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 20 },
  caption: { color: '#68788d', fontSize: 14 },
})
