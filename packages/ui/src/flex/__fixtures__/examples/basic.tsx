/**
 * @title 组件预览
 * @description 使用 Flex 和 Flex.Item 快速构建带主轴分布的行布局。
 */
import { Flex, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function FlexOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Flex direction="row" justify="between">
          <Flex.Item>左侧</Flex.Item>
          <Flex.Item>右侧</Flex.Item>
        </Flex>
      </View>
    </ThemeProvider>
  )
}
