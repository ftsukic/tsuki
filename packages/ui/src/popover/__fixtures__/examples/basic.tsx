/**
 * @title 组件预览
 */
import { Popover, PopoverText, ThemeProvider } from '@ftsukic/react-native-ui'
import { Text, View } from 'react-native'

export default function PopoverOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Popover content={<PopoverText text="菜单项" />}>
          <Text>打开菜单</Text>
        </Popover>
      </View>
    </ThemeProvider>
  )
}
