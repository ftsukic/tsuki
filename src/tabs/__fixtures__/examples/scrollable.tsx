import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Scrollable tabs
 * @description Render twenty tabs in a horizontally scrollable navigation bar.
 */
export default function ScrollableTabsExample() {
  return (
    <View style={{ gap: 16 }}>
      <Tabs scrollable defaultValue="tab-1">
        {Array.from({ length: 20 }, (_, index) => {
          const name = `tab-${index + 1}`
          return (
            <Tab key={name} name={name} title={`标签 ${index + 1}`}>
              <Text>当前是第 {index + 1} 个标签</Text>
            </Tab>
          )
        })}
      </Tabs>
    </View>
  )
}
