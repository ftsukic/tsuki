import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Content transition animation
 * @description Enable animation for programmatic content pane changes.
 */
export default function AnimatedTabsExample() {
  return (
    <View style={{ gap: 12 }}>
      <Tabs animated defaultValue="overview">
        <Tab name="overview" title="概览">
          <Text>概览内容</Text>
        </Tab>
        <Tab name="detail" title="详情">
          <Text>详情内容</Text>
        </Tab>
      </Tabs>
    </View>
  )
}
