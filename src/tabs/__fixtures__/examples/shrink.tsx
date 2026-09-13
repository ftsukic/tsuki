import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Shrink tabs
 * @description Use content-sized tabs with custom title styling instead of equal-width tabs.
 */
export default function ShrinkTabsExample() {
  return (
    <View style={{ gap: 16 }}>
      <Tabs shrink defaultValue="overview">
        <Tab name="overview" title="概览" titleStyle={{ fontWeight: '700' }}>
          <Text>内容宽度由标题和水平内边距决定。</Text>
        </Tab>
        <Tab name="activity" title="最近活动">
          <Text>第二个标题不再被等分布局强制拉伸。</Text>
        </Tab>
        <Tab name="settings" title="设置">
          <Text>shrink 会同时启用横向滚动导航。</Text>
        </Tab>
      </Tabs>
    </View>
  )
}
