import { Col, Row } from '../../..'
import { StyleSheet, Text } from 'react-native'

/**
 * @title Layout align
 * @description Align columns on the cross axis while keeping their different heights.
 */
export default function LayoutAlignFixture() {
  return (
    <Row align="center" gutter={12}>
      <Col span={8} style={[styles.col, styles.short]}>
        <Text style={styles.text}>short</Text>
      </Col>
      <Col span={8} style={[styles.col, styles.tall]}>
        <Text style={styles.text}>tall</Text>
      </Col>
      <Col span={8} style={[styles.col, styles.medium]}>
        <Text style={styles.text}>medium</Text>
      </Col>
    </Row>
  )
}

const styles = StyleSheet.create({
  col: {
    backgroundColor: '#fff1f0',
    justifyContent: 'center',
  },
  medium: {
    height: 64,
  },
  short: {
    height: 40,
  },
  tall: {
    height: 88,
  },
  text: {
    color: '#cf1322',
    textAlign: 'center',
  },
})
