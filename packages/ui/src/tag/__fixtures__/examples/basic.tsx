/**
 * @title 组件预览
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
