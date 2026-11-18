import { ConfigProvider, Text, Watermark } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Watermark theme
 * @description Override Watermark component tokens with ConfigProvider.
 */
export default function WatermarkThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Watermark: {
            color: '#1677ff',
            fontSize: 13,
            gapX: 8,
            gapY: 16,
            height: 72,
            opacity: 0.18,
            rotate: -12,
            width: 120,
          },
        },
      }}
    >
      <Watermark style={styles.container} content="THEME">
        <View style={styles.content}>
          <Text style={styles.title}>主题 token</Text>
          <Text type="secondary">Watermark 的默认视觉参数来自组件 token。</Text>
        </View>
      </Watermark>
    </ConfigProvider>
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
