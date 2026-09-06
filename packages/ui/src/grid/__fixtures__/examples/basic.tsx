/**
 * @title Grid 基础用法
 * @description 使用 Row 和 Col 组织 24 栅格。
 */
import { Col, Row } from '@ftsukic/react-native-ui'
import { Text } from 'react-native'

export default function Example() {
  return (
    <Row gap={8}>
      <Col span={8}>
        <Text>左</Text>
      </Col>
      <Col span={8}>
        <Text>中</Text>
      </Col>
      <Col span={8}>
        <Text>右</Text>
      </Col>
    </Row>
  )
}
