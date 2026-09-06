/**
 * @title 组件预览
 */
import { Tree, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function TreeOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Tree options={[{ value: 'a', label: '节点 A' }]} />
      </View>
    </ThemeProvider>
  )
}
