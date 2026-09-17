import { useState } from 'react'
import { Button, Popover, Text as TsukiText } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'

/**
 * @title Custom content
 * @description Replace the action list with custom content and close it from inside.
 */
export default function PopoverCustomContentFixture() {
  const [visible, setVisible] = useState(false)

  return (
    <Popover
      content={
        <View style={styles.content}>
          <TsukiText>这里是自定义内容</TsukiText>
          <Button size="small" onPress={() => setVisible(false)}>
            关闭
          </Button>
        </View>
      }
      trigger="manual"
      visible={visible}
    >
      <Button onPress={() => setVisible(true)}>自定义内容</Button>
    </Popover>
  )
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
  },
})
