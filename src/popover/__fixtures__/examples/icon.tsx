import { Icon, Popover } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Popover icons
 * @description Use icons and per-action colors in the action menu.
 */
export default function PopoverIconFixture() {
  return (
    <View style={styles.container}>
      <Popover
        actions={[
          { icon: <Icon name="CheckOutlined" />, text: '完成' },
          { icon: <Icon name="InfoCircleOutlined" />, text: '详情', color: '#1989fa' },
        ]}
      >
        <Text style={styles.trigger}>图标操作</Text>
      </Popover>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  trigger: {
    color: '#1989fa',
    fontSize: 15,
    padding: 8,
  },
})
