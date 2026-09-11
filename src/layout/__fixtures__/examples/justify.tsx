import { Col, Row } from '../../..'
import { StyleSheet, Text } from 'react-native'

/**
 * @title Layout justify
 * @description Map justify directly to React Native flexbox alignment.
 */
export default function LayoutJustifyFixture() {
  return (
    <Row justify="space-between">
      <Col span={5} style={styles.col}>
        <Text style={styles.text}>start</Text>
      </Col>
      <Col span={5} style={styles.col}>
        <Text style={styles.text}>end</Text>
      </Col>
    </Row>
  )
}

const styles = StyleSheet.create({
  col: {
    backgroundColor: '#f9f0ff',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: '#722ed1',
    textAlign: 'center',
  },
})
