import { ConfigProvider, Loading } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Theme and styles
 * @description Override Loading tokens and semantic slots through ConfigProvider.
 */
export default function LoadingThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Loading: {
            animationDuration: 240,
            defaultColor: '#7232DD',
            defaultSize: 24,
            textColor: '#344054',
            textGap: 10,
            textFontSize: 12,
          },
        },
      }}
    >
      <View style={styles.container}>
        <Loading
          styles={{
            indicator: { backgroundColor: '#F4F0FF', borderRadius: 8 },
            root: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
            content: { backgroundColor: '#F4F0FF', padding: 4, borderRadius: 4 },
            text: { fontWeight: '600' },
          }}
        >
          自定义主题
        </Loading>
        <Loading styles={{ content: { padding: 4 } }}>
          <Text style={styles.caption}>自定义内容</Text>
        </Loading>
        <Text style={styles.caption}>Loading token + semantic slots</Text>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  caption: {
    color: '#667085',
    fontSize: 12,
    marginTop: 12,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    minHeight: 144,
    padding: 24,
  },
})
