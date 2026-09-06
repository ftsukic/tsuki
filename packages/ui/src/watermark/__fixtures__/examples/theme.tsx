import { ThemeProvider, Watermark } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 主题和语义样式
 * @description 通过 Watermark token 设置默认文字颜色，并使用 root、canvas 语义样式覆盖实例外观。
 */
export default function WatermarkThemeExample() {
  return (
    <ThemeProvider
      theme={{
        components: {
          Watermark: {
            textColor: '#7232dd',
            zIndex: 200,
          },
        },
      }}
    >
      <View style={styles.card}>
        <Text style={styles.body}>主题 token 和语义样式都不会影响底层内容交互。</Text>
        <Watermark
          content="主题水印"
          styles={{
            root: { opacity: 0.75 },
            canvas: { transform: [{ scale: 1.02 }] },
          }}
        />
      </View>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  body: { color: '#68788d', fontSize: 14, lineHeight: 22 },
})
