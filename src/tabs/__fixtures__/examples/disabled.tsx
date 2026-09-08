import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Disabled tabs
 * @description Keep disabled tabs visible while preventing selection changes.
 */
export default function DisabledTabsExample() {
  return (
    <View style={{ gap: 16 }}>
      <Tabs defaultValue="available">
        <Tab name="available" title="可用">
          <Text>可用内容</Text>
        </Tab>
        <Tab disabled name="disabled" title="暂不可用">
          <Text>不会被点击打开</Text>
        </Tab>
        <Tab name="another" title="其他">
          <Text>其他内容</Text>
        </Tab>
      </Tabs>
    </View>
  )
}
