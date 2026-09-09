import { ConfigProvider, Progress } from '../../..'
import { StyleSheet, View } from 'react-native'

/**
 * @title Theme tokens
 * @description Override Progress token values through ConfigProvider.
 */
export default function ProgressThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Progress: {
            progress_circle_size: 88,
            progress_color: '#7232DD',
            progress_height: 8,
            progress_pivot_color: '#7232DD',
            progress_track_color: '#F0E8FF',
          },
        },
      }}
    >
      <View style={styles.container}>
        <Progress
          percentage={76}
          styles={{
            pivot: { paddingHorizontal: 8 },
            track: { height: 10 },
          }}
        />
        <Progress percentage={76} styles={{ circleLabel: { fontWeight: '700' } }} type="circle" />
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
    justifyContent: 'center',
    minHeight: 144,
    padding: 24,
  },
})
