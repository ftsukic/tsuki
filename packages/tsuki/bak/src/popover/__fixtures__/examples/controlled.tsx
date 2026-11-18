import { useState } from 'react'
import { Button, Popover } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Controlled Popover
 * @description Drive visibility yourself with a manual trigger and onVisibleChange.
 */
export default function PopoverControlledFixture() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Popover
        actions={[{ text: '受控操作' }]}
        onVisibleChange={setVisible}
        trigger="manual"
        visible={visible}
      >
        <Button onPress={() => setVisible(true)}>受控打开</Button>
      </Popover>
      <Text style={styles.caption}>visible: {String(visible)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  caption: {
    color: '#667085',
    fontSize: 13,
  },
  container: {
    gap: 10,
  },
})
