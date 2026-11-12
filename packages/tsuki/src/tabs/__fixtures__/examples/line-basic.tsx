import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Line basic
 * @description Render a line-style tab bar with optional content under the active tab.
 */
export default function LineBasicExample() {
  return (
    <View style={{ gap: 16 }}>
      <Tabs defaultValue="home">
        <Tab name="home" title="首页">
          <Text>首页内容</Text>
        </Tab>
        <Tab name="category" title="分类">
          <Text>分类内容</Text>
        </Tab>
        <Tab name="profile" title="我的">
          <Text>我的内容</Text>
        </Tab>
      </Tabs>
    </View>
  )
}
