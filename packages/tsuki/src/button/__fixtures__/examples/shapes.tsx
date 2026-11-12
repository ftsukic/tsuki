import React from 'react'

import { Button, Icon } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 按钮形状
 * @description 比较不同尺寸下的默认、方角、胶囊和纯图标圆形按钮。
 */
export default function ButtonShapesFixture() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>按钮形状</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Button type="primary">默认</Button>
          <Text style={styles.caption}>默认</Text>
        </View>
        <View style={styles.item}>
          <Button type="primary" shape="square">
            方角
          </Button>
          <Text style={styles.caption}>方角</Text>
        </View>
        <View style={styles.item}>
          <Button type="primary" shape="round">
            胶囊
          </Button>
          <Text style={styles.caption}>胶囊</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            shape="circle"
            icon={<Icon name="PlusOutlined" size={18} color="#ffffff" />}
            accessibilityLabel="新增"
          />
          <Text style={styles.caption}>圆形图标</Text>
        </View>
      </View>

      <Text style={styles.heading}>圆形按钮尺寸</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Button
            type="primary"
            size="mini"
            shape="circle"
            icon={<Icon name="PlusOutlined" size={10} color="#ffffff" />}
            accessibilityLabel="新增（mini）"
          />
          <Text style={styles.caption}>mini</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            size="small"
            shape="circle"
            icon={<Icon name="PlusOutlined" size={12} color="#ffffff" />}
            accessibilityLabel="新增（small）"
          />
          <Text style={styles.caption}>small</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            size="normal"
            shape="circle"
            icon={<Icon name="PlusOutlined" size={16} color="#ffffff" />}
            accessibilityLabel="新增（normal）"
          />
          <Text style={styles.caption}>normal</Text>
        </View>
        <View style={styles.item}>
          <Button
            type="primary"
            size="large"
            shape="circle"
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
