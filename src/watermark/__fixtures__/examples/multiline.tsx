import { StyleSheet, View } from 'react-native'
import { Text, Watermark } from '../../..'

/**
 * @title Multiline watermark
 * @description Render an array as multiple centered lines inside every watermark mark.
 */
export default function WatermarkMultilineExample() {
  return (
    <Watermark content={['Tsuki', 'Confidential']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>内部业务资料</Text>
        <Text type="secondary">数组内容是一个水印块的多行文字。</Text>
      </View>
    </Watermark>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minHeight: 180,
    padding: 24,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
})
