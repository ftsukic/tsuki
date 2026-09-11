import { Flex } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Flex wrap
 * @description Allow a row of siblings to wrap while preserving the native gap.
 */
export default function FlexWrapFixture() {
  return (
    <Flex wrap gap={10} style={styles.container}>
      {[1, 2, 3, 4, 5].map((value) => (
        <View key={value} style={styles.item}>
          <Text style={styles.text}>item {value}</Text>
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
    backgroundColor: '#fff7e6',
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  text: {
    color: '#d46b08',
  },
})
