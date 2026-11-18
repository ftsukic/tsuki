import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Swipeable tabs
 * @description Switch content by swiping horizontally when swipeable is enabled.
 */
export default function SwipeableTabsExample() {
  return (
    <View style={{ gap: 16 }}>
      <Tabs defaultValue="overview" swipeable>
        <Tab name="overview" title="概览">
          <Text>向左或向右滑动，切换到相邻的内容。</Text>
        </Tab>
        <Tab name="activity" title="动态">
          <Text>这里展示当前项目的动态记录。</Text>
        </Tab>
        <Tab name="settings" title="设置">
          <Text>这里展示当前项目的设置项。</Text>
        </Tab>
      </Tabs>
    </View>
  )
}
