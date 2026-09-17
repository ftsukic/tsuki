import { Button, Popover } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Disabled Popover action
 * @description Keep an unavailable action visible without allowing it to be selected.
 */
export default function PopoverDisabledFixture() {
  return (
    <View style={styles.container}>
      <Popover
        actions={[
          { text: '编辑' },
          { text: '暂不可用', disabled: true },
          { text: '删除', color: '#ee0a24' },
        ]}
      >
        <Button>含禁用项</Button>
      </Popover>
      <Popover actions={[{ text: '不会打开' }]} disabled>
        <Button variant="outline">禁用触发器</Button>
      </Popover>
      <Text style={styles.caption}>禁用 action 不响应点击；禁用触发器仍保留自身展示。</Text>
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
