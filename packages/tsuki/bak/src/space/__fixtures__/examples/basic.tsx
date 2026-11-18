import { Space } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Space basic
 * @description Arrange a compact group of actions horizontally.
 */
export default function SpaceBasicFixture() {
  return (
    <Space gap={12} align="center" style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.text}>取消</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.text}>保存</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.text}>提交</Text>
      </View>
    </Space>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    backgroundColor: '#f0f5ff',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    color: '#1d39c4',
  },
})
