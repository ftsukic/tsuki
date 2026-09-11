import { Space } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Space wrap and alignment
 * @description Wrap a horizontal group and align its children on the cross axis.
 */
export default function SpaceWrapFixture() {
  return (
    <Space wrap gap={8} align="center" style={styles.container}>
      {['草稿', '审核中', '已发布', '已归档'].map((label) => (
        <View key={label} style={styles.item}>
          <Text style={styles.text}>{label}</Text>
        </View>
      ))}
    </Space>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff1f0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: {
    color: '#cf1322',
  },
})
