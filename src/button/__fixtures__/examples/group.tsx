import React from 'react'

import { Button, ButtonGroup } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 按钮组
 * @description 展示横向连接的按钮组、继承的尺寸和子按钮覆盖配置。
 */
export default function ButtonGroupFixture() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>基础按钮组</Text>
      <Button.Group shape="default">
        <Button>左侧</Button>
        <Button>中间</Button>
        <Button>右侧</Button>
      </Button.Group>

      <Text style={styles.heading}>主要按钮组</Text>
      <ButtonGroup>
        <Button type="primary">新增</Button>
        <Button type="primary">编辑</Button>
        <Button type="primary">删除</Button>
      </ButtonGroup>

      <Text style={styles.heading}>继承变体与子项覆盖</Text>
      <ButtonGroup variant="outlined">
        <Button>继承边框</Button>
        <Button variant="solid">显式实心</Button>
        <Button>继承边框</Button>
      </ButtonGroup>

      <Text style={styles.heading}>继承尺寸与子项覆盖</Text>
      <ButtonGroup size="small">
        <Button>小号</Button>
        <Button size="large">显式大号</Button>
        <Button>小号</Button>
      </ButtonGroup>

      <Text style={styles.heading}>胶囊按钮组</Text>
      <ButtonGroup shape="round">
        <Button>未读通知</Button>
        <Button>已读通知</Button>
      </ButtonGroup>

      <Text style={styles.heading}>边框按钮组</Text>
      <ButtonGroup>
        <Button type="primary" variant="outlined">
          筛选
        </Button>
        <Button type="primary" variant="outlined">
          排序
        </Button>
        <Button type="primary" variant="outlined">
          重置
        </Button>
      </ButtonGroup>

      <Text style={styles.heading}>单个按钮</Text>
      <ButtonGroup>
        <Button type="primary" round>
          单个按钮
        </Button>
      </ButtonGroup>

      <Text style={styles.heading}>等分宽度</Text>
      <ButtonGroup block>
        <Button>取消</Button>
        <Button type="primary">确认并保存</Button>
      </ButtonGroup>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
})
