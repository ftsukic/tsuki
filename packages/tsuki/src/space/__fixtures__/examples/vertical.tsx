import { Space } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Space vertical
 * @description Stack sibling content vertically with a fixed gap.
 */
export default function SpaceVerticalFixture() {
  return (
    <Space direction="vertical" gap={10} style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.text}>标题</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.text}>描述内容</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.text}>辅助信息</Text>
      </View>
    </Space>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    backgroundColor: '#f6ffed',
    borderRadius: 6,
    padding: 12,
  },
  text: {
    color: '#389e0d',
  },
})
