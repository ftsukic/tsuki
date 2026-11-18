import { Flex } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Flex alignment
 * @description Combine align and justify for a toolbar-like layout.
 */
export default function FlexAlignmentFixture() {
  return (
    <Flex align="center" justify="space-between" style={styles.container}>
      <Text style={styles.label}>标题</Text>
      <View style={styles.action}>
        <Text style={styles.actionText}>操作</Text>
      </View>
    </Flex>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#1677ff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: '#ffffff',
  },
  container: {
    padding: 16,
  },
  label: {
    color: '#262626',
    fontSize: 16,
    fontWeight: '600',
  },
})
