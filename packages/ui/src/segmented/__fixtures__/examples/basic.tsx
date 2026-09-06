/**
 * @title 组件预览
 */
import { Segmented, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function SegmentedOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Segmented options={['全部', '未读']} defaultValue="全部" />
      </View>
    </ThemeProvider>
  )
}
