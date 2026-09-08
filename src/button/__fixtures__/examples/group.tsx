import React from 'react'

import { Button, ButtonGroup } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Button groups
 * @description Show connected horizontal button groups, inherited sizes and child overrides.
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

      <Text style={styles.heading}>Primary group</Text>
      <ButtonGroup>
        <Button type="primary">新增</Button>
        <Button type="primary">编辑</Button>
        <Button type="primary">删除</Button>
      </ButtonGroup>

      <Text style={styles.heading}>Outline group</Text>
      <ButtonGroup>
        <Button type="primary" variant="outline" round>
          新增
        </Button>
        <Button type="primary" variant="outline">
          编辑
        </Button>
        <Button type="primary" variant="outline" round>
          删除
        </Button>
      </ButtonGroup>

      <Text style={styles.heading}>Small / large</Text>
      <ButtonGroup size="small">
        <Button>Small</Button>
        <Button size="large">Large override</Button>
        <Button>Small</Button>
      </ButtonGroup>

      <Text style={styles.heading}>Round group</Text>
      <ButtonGroup shape="round">
        <Button>未读通知</Button>
        <Button>已读通知</Button>
      </ButtonGroup>

      <Text style={styles.heading}>Outline group</Text>
      <ButtonGroup>
        <Button type="primary" variant="outline">
          筛选
        </Button>
        <Button type="primary" variant="outline">
          排序
        </Button>
        <Button type="primary" variant="outline">
          重置
        </Button>
      </ButtonGroup>

      <Text style={styles.heading}>Single button</Text>
      <ButtonGroup>
        <Button type="primary" round>
          单个按钮
        </Button>
      </ButtonGroup>

      <Text style={styles.heading}>Block group</Text>
      <ButtonGroup block>
        <Button>取消</Button>
        <Button type="primary">确认</Button>
      </ButtonGroup>

      <Text style={styles.heading}>Single button</Text>
      <ButtonGroup>
        <Button block type="primary" round>
          单个按钮
        </Button>
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
