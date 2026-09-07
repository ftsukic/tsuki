import { StyleSheet, Text, View } from 'react-native'
import { Col, ConfigProvider, Row } from '../..'

/**
 * @title Grid layout
 * @description Use a 24-column row with gaps and offsets.
 */
export default function GridBasicFixture() {
  return (
    <ConfigProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>24 栅格</Text>
        <Row gap={16}>
          <Col span={8}>
            <View style={[styles.cell, styles.primaryCell]}>
              <Text style={styles.lightText}>8</Text>
            </View>
          </Col>
          <Col span={8}>
            <View style={[styles.cell, styles.successCell]}>
              <Text style={styles.lightText}>8</Text>
            </View>
          </Col>
          <Col span={8}>
            <View style={[styles.cell, styles.warningCell]}>
              <Text style={styles.lightText}>8</Text>
            </View>
          </Col>
        </Row>

        <Text style={styles.heading}>偏移</Text>
        <Row gap={16}>
          <Col span={8} offset={4}>
            <View style={[styles.cell, styles.primaryCell]}>
              <Text style={styles.lightText}>span 8 / offset 4</Text>
            </View>
          </Col>
          <Col span={8}>
            <View style={[styles.cell, styles.successCell]}>
              <Text style={styles.lightText}>span 8</Text>
            </View>
          </Col>
        </Row>
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
  cell: {
    alignItems: 'center',
    borderRadius: 4,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  primaryCell: {
    backgroundColor: '#1989FA',
  },
  successCell: {
    backgroundColor: '#07C160',
  },
  warningCell: {
    backgroundColor: '#FF976A',
  },
  lightText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
})
