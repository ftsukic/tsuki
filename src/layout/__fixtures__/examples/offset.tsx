import { Col, Row } from '../../..'
import { StyleSheet, Text } from 'react-native'

/**
 * @title Layout offset
 * @description Reserve four columns before an eight-column item.
 */
export default function LayoutOffsetFixture() {
  return (
    <Row>
      <Col span={8} offset={4} style={styles.col}>
        <Text style={styles.text}>offset 4 / span 8</Text>
      </Col>
    </Row>
  )
}

const styles = StyleSheet.create({
  col: {
    backgroundColor: '#fff7e6',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: '#d46b08',
    textAlign: 'center',
  },
})
