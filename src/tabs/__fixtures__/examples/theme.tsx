import { ConfigProvider } from '@ftsukic/tsuki'
import { Tab, Tabs, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Theme and semantic styles
 * @description Customize Tabs with component tokens and semantic styles.
 */
export default function TabsThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            indicatorColor: '#1677ff',
            indicatorWidth: 56,
          },
        },
      }}
    >
      <View style={{ gap: 12 }}>
        <Tabs
          defaultValue="updates"
          styles={({ state }) => ({
            content: {
              backgroundColor: state.activeIndex === 0 ? '#f0f5ff' : '#f6ffed',
              padding: 12,
            },
            label: { fontWeight: state.activeIndex === 0 ? '600' : '400' },
          })}
        >
          <Tab name="updates" title="更新">
            <Text>这里展示更新内容。</Text>
          </Tab>
          <Tab name="security" title="安全">
            <Text>这里展示安全内容。</Text>
          </Tab>
        </Tabs>
      </View>
    </ConfigProvider>
  )
}
