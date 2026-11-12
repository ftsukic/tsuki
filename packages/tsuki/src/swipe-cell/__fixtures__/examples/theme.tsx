import { ConfigProvider, SwipeCell, Text } from '../../..'
import { View } from 'react-native'

/**
 * @title 主题样式
 * @description 通过组件 token 调整 action 和主体按压背景。
 */
export default function SwipeCellThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        components: {
          SwipeCell: {
            actionBackgroundColor: '#7232dd',
            actionMinWidth: 88,
            pressedBackgroundColor: '#f3ecff',
          },
        },
      }}
    >
      <View style={{ gap: 12 }}>
        <SwipeCell rightAction="自定义">
          <View style={{ padding: 16, gap: 4 }}>
            <Text>主题定制</Text>
            <Text type="secondary">按住主体或左滑查看自定义配色</Text>
          </View>
        </SwipeCell>
        <Text>SwipeCell：actionBackgroundColor / actionMinWidth</Text>
        <Text>SwipeCell：pressedBackgroundColor</Text>
      </View>
    </ConfigProvider>
  )
}
