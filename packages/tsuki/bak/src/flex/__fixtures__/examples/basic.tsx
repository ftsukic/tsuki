import { Flex } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Flex basic
 * @description Arrange sibling views in a row with a native gap.
 */
export default function FlexBasicFixture() {
  return (
    <Flex gap={12} align="center" style={styles.container}>
      {['one', 'two', 'three'].map((label) => (
        <View key={label} style={styles.item}>
          <Text style={styles.text}>{label}</Text>
        </View>
      ))}
    </Flex>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    backgroundColor: '#e6f4ff',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    color: '#1677ff',
  },
})
