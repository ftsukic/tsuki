/**
 * @title 组件预览
 */
import { Steps, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function StepsOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Steps current={1} data={[{ title: '开始' }, { title: '完成' }]} />
      </View>
    </ThemeProvider>
  )
}
