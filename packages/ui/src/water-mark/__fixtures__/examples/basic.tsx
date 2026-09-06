/**
 * @title 组件预览
 * @description 使用文字水印覆盖父容器，水印层不拦截触摸事件。
 */
import { WaterMark, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function WaterMarkOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <WaterMark text="仅供内部使用" />
      </View>
    </ThemeProvider>
  )
}
