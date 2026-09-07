import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button, Col, ConfigProvider, Icon, Row } from '../..'

/**
 * @title Button variants
 * @description Check the common button types, states, sizes and semantic slots.
 */
export default function ButtonVariantsFixture() {
  const [pressCount, setPressCount] = useState(0)

  return (
    <ConfigProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>按钮类型</Text>
        <Row gap={16}>
          <Col span={8}>
            <Button type="primary" block onPress={() => setPressCount((count) => count + 1)}>
              主要按钮
            </Button>
          </Col>
          <Col span={8}>
            <Button type="success" block>
              成功按钮
            </Button>
          </Col>
          <Col span={8}>
            <Button block>默认按钮</Button>
          </Col>
          <Col span={8}>
            <Button type="danger" block>
              危险按钮
            </Button>
          </Col>
          <Col span={8}>
            <Button type="warning" block>
              警告按钮
            </Button>
          </Col>
        </Row>
        <Text style={styles.caption}>Pressed {pressCount} times</Text>

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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
})
