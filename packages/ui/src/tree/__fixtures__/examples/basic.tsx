/**
 * @title 组件预览
 * @description 使用树形 options 展示单选、展开和搜索能力的入口。
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
