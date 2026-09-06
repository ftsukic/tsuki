/**
 * @title 组件预览
 * @description 使用多个子页面展示可滑动的轮播容器。
 */
import { Swipe, ThemeProvider } from '@ftsukic/react-native-ui'
import { Text, View } from 'react-native'

export default function SwipeOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Swipe>
          <View>
            <Text>第一页</Text>
          </View>
          <View>
            <Text>第二页</Text>
          </View>
        </Swipe>
      </View>
    </ThemeProvider>
  )
}
