import { Flex } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Flex directions
 * @description Switch between row and column directions with the same component.
 */
export default function FlexDirectionsFixture() {
  return (
    <View style={styles.container}>
      <Flex direction="row" gap={8}>
        <View style={styles.item}>
          <Text style={styles.text}>row</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.text}>row</Text>
        </View>
      </Flex>
      <Flex direction="column" gap={8}>
        <View style={styles.item}>
          <Text style={styles.text}>column</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.text}>column</Text>
        </View>
      </Flex>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
