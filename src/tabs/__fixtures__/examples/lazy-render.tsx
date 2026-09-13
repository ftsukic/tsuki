import { Button, Tab, Tabs, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

function CounterPane({ label }: { label: string }) {
  const [count, setCount] = useState(0)

  return (
    <View style={{ gap: 8 }}>
      <Text>
        {label}计数：{count}
      </Text>
      <Button size="small" onPress={() => setCount((current) => current + 1)}>
        增加
      </Button>
    </View>
  )
}

/**
 * @title Lazy render
 * @description Render each pane on first activation and keep its local state when switching away.
 */
export default function LazyRenderTabsExample() {
  return (
    <View style={{ gap: 16 }}>
      <Tabs lazyRender defaultValue="first">
        <Tab name="first" title="第一项">
          <CounterPane label="第一项" />
        </Tab>
        <Tab name="second" title="第二项">
          <CounterPane label="第二项" />
        </Tab>
      </Tabs>
      <Text type="secondary">每个页面首次打开后都会保持挂载。</Text>
    </View>
  )
}
