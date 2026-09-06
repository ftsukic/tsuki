import { ThemeProvider } from '@ftsukic/react-native-ui'
import { StyleSheet, Text, View } from 'react-native'
import Basic from './examples/basic'
import FullPage from './examples/full-page'
import Geometry from './examples/geometry'
import Image from './examples/image'
import Theme from './examples/theme'

/**
 * @title 组件预览
 */
export default function WatermarkOverview() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Text style={styles.caption}>文字水印</Text>
        <Basic />
        <Text style={styles.caption}>图片水印</Text>
        <Image />
        <Text style={styles.caption}>间距与旋转</Text>
        <Geometry />
        <Text style={styles.caption}>显示范围</Text>
        <FullPage />
        <Text style={styles.caption}>主题</Text>
        <Theme />
      </View>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 20, backgroundColor: '#f7f8fa' },
  caption: { color: '#68788d', fontSize: 14 },
})
