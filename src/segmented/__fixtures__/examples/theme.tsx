import { ConfigProvider, Segmented, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Theme and semantic styles
 * @description Customize the selected thumb, selected text color, and semantic option styles.
 */
export default function SegmentedThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            selectedBackgroundColor: '#e6f4ff',
            selectedTextColor: '#0958d9',
            pressedBackgroundColor: '#f2f3f5',
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
        <Segmented defaultValue="list" selectedTextColor="#1677ff" options={['list', 'board']} />
        <Text type="secondary">
          selectedTextColor 用于单实例覆盖选中项文字颜色；selected thumb 默认使用
          colorBgContainer，semantic styles 控制局部样式。
        </Text>
      </View>
    </ConfigProvider>
  )
}
