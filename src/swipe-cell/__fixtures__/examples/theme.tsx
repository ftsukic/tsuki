import { ConfigProvider, SwipeCell } from '../../..'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Theme customization
 * @description Override SwipeCell action tokens through ConfigProvider.
 */
export default function SwipeCellThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        components: {
          SwipeCell: {
            actionBackgroundColor: '#7232DD',
            actionMinWidth: 88,
          },
        },
      }}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>主题定制</Text>
        <SwipeCell rightAction="自定义">
          <View style={styles.content}>
            <Text style={styles.title}>自定义 action token</Text>
            <Text style={styles.subtitle}>actionBackgroundColor / actionMinWidth</Text>
          </View>
        </SwipeCell>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#323233',
    fontSize: 16,
  },
  subtitle: {
    color: '#969799',
    fontSize: 13,
  },
})
