/**
 * @title 组件预览
 * @description 使用 buttons 配置底部操作按钮，并在超出数量时收纳到更多菜单。
 */
import { ButtonBar, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function ButtonBarOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <ButtonBar buttons={[{ text: '确定' }]} />
      </View>
    </ThemeProvider>
  )
}
