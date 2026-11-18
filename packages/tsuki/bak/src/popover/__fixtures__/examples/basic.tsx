import { useState } from 'react'
import { Button, Popover } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

const actions = [{ text: '编辑' }, { text: '复制' }, { text: '删除', color: '#ee0a24' }]

/**
 * @title Basic Popover
 * @description Open a Vant-style action menu and show the last selected action.
 */
export default function PopoverBasicFixture() {
  const [selected, setSelected] = useState('尚未选择')

  return (
    <View style={styles.container}>
      <Popover actions={actions} onSelect={(action) => setSelected(String(action.text))}>
        <Button>显示 Popover</Button>
      </Popover>
      <Text style={styles.caption}>最后选择：{selected}</Text>
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
