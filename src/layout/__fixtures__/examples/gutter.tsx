import { Col, Row } from '../../..'
import { StyleSheet, Text } from 'react-native'

/**
 * @title Layout horizontal gutter
 * @description Add a 16 point horizontal gutter between equal columns.
 */
export default function LayoutGutterFixture() {
  return (
    <Row gutter={16}>
      {[1, 2, 3].map((value) => (
        <Col key={value} span={8} style={styles.col}>
          <Text style={styles.text}>gutter {value}</Text>
        </Col>
      ))}
    </Row>
  )
}

const styles = StyleSheet.create({
  col: {
    backgroundColor: '#e6f7ff',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: '#0958d9',
    textAlign: 'center',
  },
})
