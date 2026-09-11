import { Col, Row } from '../../..'
import { StyleSheet, Text } from 'react-native'

/**
 * @title Layout vertical gutter
 * @description Use separate horizontal and vertical gutter values across two logical rows.
 */
export default function LayoutVerticalGutterFixture() {
  return (
    <Row gutter={[16, 8]}>
      {[1, 2, 3, 4].map((value) => (
        <Col key={value} span={12} style={styles.col}>
          <Text style={styles.text}>item {value}</Text>
        </Col>
      ))}
    </Row>
  )
}

const styles = StyleSheet.create({
  col: {
    backgroundColor: '#f6ffed',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: '#389e0d',
    textAlign: 'center',
  },
})
