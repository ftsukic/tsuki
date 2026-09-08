import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Card basic
 * @description Use the card variant for a compact bordered tab switcher.
 */
export default function CardBasicExample() {
  return (
    <View style={{ gap: 16 }}>
      <Tabs type="card" defaultValue="all">
        <Tab name="all" title="全部">
          <Text>全部项目</Text>
        </Tab>
        <Tab name="active" title="进行中">
          <Text>进行中的项目</Text>
        </Tab>
      </Tabs>
    </View>
  )
}
