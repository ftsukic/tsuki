import { ConfigProvider, Segmented, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Theme and semantic styles
 * @description Customize the selected thumb and semantic option styles.
 */
export default function SegmentedThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            activeBackgroundColor: '#e6f4ff',
            activeColor: '#0958d9',
            borderColor: '#91caff',
          },
        },
      }}
    >
      <View style={{ gap: 12 }}>
        <Segmented
          defaultValue="list"
          options={['list', 'board']}
          styles={({ state }) => ({
            label: { fontWeight: state.value === 'list' ? '600' : '400' },
            root: { borderWidth: 1, borderColor: '#91caff' },
          })}
        />
        <Text type="secondary">
          selected thumb 默认使用 colorBgContainer，选中文字默认使用 colorText，semantic styles
          控制局部样式。
        </Text>
      </View>
    </ConfigProvider>
  )
}
