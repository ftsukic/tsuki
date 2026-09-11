import { Col, Row } from '../../..'
import { StyleSheet, Text } from 'react-native'

/**
 * @title Layout custom style
 * @description Combine layout props with user styles on the Row and Col roots.
 */
export default function LayoutCustomStyleFixture() {
  return (
    <Row gutter={12} style={styles.row}>
      <Col span={12} style={styles.col}>
        <Text style={styles.text}>custom background</Text>
      </Col>
      <Col span={12} style={styles.col}>
        <Text style={styles.text}>custom radius</Text>
      </Col>
    </Row>
  )
}

const styles = StyleSheet.create({
  col: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  row: {
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  text: {
    color: '#434343',
    textAlign: 'center',
  },
})
