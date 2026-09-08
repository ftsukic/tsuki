import React from 'react'

import { Button, Icon } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Button shapes
 * @description Compare the default, square, round and icon-only circle shapes across sizes.
 */
export default function ButtonShapesFixture() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>按钮形状</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Button type="primary">Default</Button>
          <Text style={styles.caption}>Default</Text>
        </View>
        <View style={styles.item}>
          <Button type="primary" square>
            Square
          </Button>
          <Text style={styles.caption}>Square</Text>
        </View>
        <View style={styles.item}>
          <Button type="primary" round>
            Round
          </Button>
          <Text style={styles.caption}>Round</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            circle
            icon={<Icon name="PlusOutlined" size={18} color="#ffffff" />}
            accessibilityLabel="新增"
          />
          <Text style={styles.caption}>Circle icon</Text>
        </View>
      </View>

      <Text style={styles.heading}>Circle sizes</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Button
            type="primary"
            size="mini"
            circle
            icon={<Icon name="PlusOutlined" size={10} color="#ffffff" />}
            accessibilityLabel="新增（mini）"
          />
          <Text style={styles.caption}>mini</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            size="small"
            circle
            icon={<Icon name="PlusOutlined" size={12} color="#ffffff" />}
            accessibilityLabel="新增（small）"
          />
          <Text style={styles.caption}>small</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            size="normal"
            circle
            icon={<Icon name="PlusOutlined" size={16} color="#ffffff" />}
            accessibilityLabel="新增（normal）"
          />
          <Text style={styles.caption}>normal</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            size="large"
            circle
            icon={<Icon name="PlusOutlined" size={20} color="#ffffff" />}
            accessibilityLabel="新增（large）"
          />
          <Text style={styles.caption}>large</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  item: {
    alignItems: 'center',
    gap: 8,
  },
  caption: {
    color: '#666666',
    fontSize: 12,
  },
})
