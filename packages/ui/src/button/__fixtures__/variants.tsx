import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button, ConfigProvider, Icon } from '../..'

/**
 * @title Button variants
 * @description Check the common button types, states, sizes and semantic slots.
 */
export default function ButtonVariantsFixture() {
  const [pressCount, setPressCount] = useState(0)

  return (
    <ConfigProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>Types</Text>
        <View style={styles.stack}>
          <Button type="primary" block onPress={() => setPressCount((count) => count + 1)}>
            Primary
          </Button>
          <Text style={styles.caption}>Pressed {pressCount} times</Text>
          <Button type="success" block>
            Success
          </Button>
          <Button type="warning" block>
            Warning
          </Button>
          <Button type="danger" block>
            Danger
          </Button>
        </View>

        <Text style={styles.heading}>Sizes and states</Text>
        <View style={styles.row}>
          <Button size="large" round>
            Large
          </Button>
          <Button size="small" plain>
            Small
          </Button>
          <Button size="mini" square>
            <Icon name="PlusOutlined" size={14} />
          </Button>
        </View>
        <View style={styles.row}>
          <Button disabled>Disabled</Button>
          <Button loading loadingText="Saving">
            Save
          </Button>
        </View>

        <Button
          type="primary"
          block
          hairline
          icon={<Icon name="CheckOutlined" size={16} color="#ffffff" />}
          styles={{ content: { fontWeight: '600' } }}
        >
          Semantic styles
        </Button>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    color: '#666666',
    fontSize: 13,
  },
  stack: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
})
