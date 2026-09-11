import { Col, Row } from '../../..'
import { StyleSheet, Text } from 'react-native'

/**
 * @title Layout wrap
 * @description Let 16 + 16 columns form two logical rows with a vertical gutter.
 */
export default function LayoutWrapFixture() {
  return (
    <Row gutter={[16, 10]}>
      {[1, 2, 3].map((value) => (
        <Col key={value} span={16} style={styles.col}>
          <Text style={styles.text}>row item {value}</Text>
        </Col>
      ))}
    </Row>
  )
}

const styles = StyleSheet.create({
  col: {
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: '#1d39c4',
    textAlign: 'center',
  },
})
