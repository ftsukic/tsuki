import React from 'react'

import { Button, Col, Icon, Row } from '@ftsukic/tsuki'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 按钮变体
 * @description 展示常用类型、快捷配色、五种视觉变体和自定义颜色。
 */
export default function ButtonVariantsFixture() {
  const [pressCount, setPressCount] = useState(0)

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>常用类型</Text>
      <Row gutter={16}>
        <Col span={8}>
          <Button block>默认按钮</Button>
        </Col>
        <Col span={8}>
          <Button type="primary" block onPress={() => setPressCount((count) => count + 1)}>
            主要按钮
          </Button>
        </Col>
        <Col span={8}>
          <Button type="dashed" block>
            虚线按钮
          </Button>
        </Col>
        <Col span={8}>
          <Button type="text" block>
            文字按钮
          </Button>
        </Col>
      </Row>
      <Text style={styles.caption}>已点击 {pressCount} 次</Text>

      <Text style={styles.heading}>快捷配色</Text>
      <View style={styles.row}>
        <Button danger>删除</Button>
        <Button success>已完成</Button>
        <Button warning>提醒</Button>
        <Button type="text" danger>
          文字删除
        </Button>
      </View>
      <View style={styles.row}>
        <Button type="primary" danger>
          确认删除
        </Button>
        <Button type="primary" success>
          完成
        </Button>
        <Button type="primary" warning>
          警告
        </Button>
        <Button color="success" variant="filled">
          成功填充
        </Button>
      </View>
      <Text style={styles.heading}>视觉变体</Text>
      <Row gutter={16}>
        <Col span={8}>
          <Button type="primary" variant="solid" block>
            实心
          </Button>
        </Col>
        <Col span={8}>
          <Button type="primary" variant="dashed" block>
            虚线
          </Button>
        </Col>
        <Col span={8}>
          <Button type="primary" variant="outlined" block>
            边框
          </Button>
        </Col>
        <Col span={8}>
          <Button type="primary" variant="filled" block>
            浅色填充
          </Button>
        </Col>
        <Col span={8}>
          <Button type="primary" variant="text" block>
            文字
          </Button>
        </Col>
        <Col span={8}>
          <Button color="#7232DD" variant="solid" block>
            自定义颜色
          </Button>
        </Col>
      </Row>

      <Button
        type="primary"
        block
        hairline
        icon={<Icon name="CheckOutlined" size={16} color="#ffffff" />}
        styles={{ content: { fontWeight: '600' } }}
      >
        语义样式
      </Button>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  caption: {
    color: '#666666',
    fontSize: 13,
  },
})
