import { StyleSheet, View } from 'react-native'
import { Text, Watermark } from '../../..'

/**
 * @title Watermark layout
 * @description Compare custom mark size, gaps, offsets, rotation, and opacity.
 */
export default function WatermarkLayoutExample() {
  return (
    <View style={styles.stack}>
      <Watermark
        content="Layout"
        gapX={12}
        gapY={24}
        height={72}
        offsetX={18}
        offsetY={-10}
        opacity={0.24}
        rotate={-16}
        style={styles.large}
        width={120}
      >
        <View style={styles.content}>
          <Text style={styles.title}>自定义布局参数</Text>
          <Text type="secondary">每个 mark 独立旋转。</Text>
        </View>
      </Watermark>
      <Text type="secondary">
        width / height · gapX / gapY · offsetX / offsetY · rotate · opacity
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  large: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minHeight: 180,
    padding: 24,
    width: '100%',
  },
  stack: {
    gap: 10,
  },
  title: {
    fontWeight: '600',
  },
})
