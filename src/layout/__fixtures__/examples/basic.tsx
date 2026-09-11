import { Col, Row } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Layout basic
 * @description Use three equal columns in the 24-column layout.
 */
export default function LayoutBasicFixture() {
  return (
    <Row>
      {['第一列', '第二列', '第三列'].map((label) => (
        <Col key={label} span={8} style={styles.col}>
          <View style={styles.cell}>
            <Text style={styles.text}>{label}</Text>
          </View>
        </Col>
      ))}
    </Row>
  )
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    backgroundColor: '#e8f3ff',
    borderRadius: 6,
    paddingVertical: 12,
  },
  col: {
    minHeight: 48,
  },
  text: {
    color: '#1677ff',
    fontSize: 14,
  },
})
