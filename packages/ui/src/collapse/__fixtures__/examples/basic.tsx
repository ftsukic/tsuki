/**
 * @title 组件预览
 * @description 展示可展开和收起的标题与内容区域。
 */
import { Collapse, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function CollapseOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Collapse title="更多" defaultCollapse={false}>
          内容
        </Collapse>
      </View>
    </ThemeProvider>
  )
}
