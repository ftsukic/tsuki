/**
 * @title 组件预览
 * @description 展示默认标签以及尺寸、类型和关闭操作的扩展点。
 */
import { Tag, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function TagOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Tag>标签</Tag>
      </View>
    </ThemeProvider>
  )
}
