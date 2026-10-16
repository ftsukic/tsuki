import { StyleSheet, View } from 'react-native'
import { ConfigProvider, Slider, Text, useToken } from '@ftsukic/tsuki'

const FONT_SIZES = [16, 18, 20, 24, 26, 28, 30]
const MARKS = Object.fromEntries(FONT_SIZES.map((_, index) => [index, null]))

export function FontSizeSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const { token } = useToken()
  return (
    <View>
      <View style={styles.labels}>
        <Text style={styles.smallA}>A</Text>
        <Text style={[styles.standard, { color: token.colorTextSecondary }]}>标准</Text>
        <Text style={styles.largeA}>A</Text>
      </View>
      <ConfigProvider theme={{ components: { Slider: { thumbSize: 28 } } }}>
        <Slider
          testID="font-size-slider"
          min={0}
          max={6}
          step={1}
          value={FONT_SIZES.indexOf(value)}
          marks={MARKS}
          included={false}
          accessibilityLabel="字体大小"
          accessibilityValue={{ text: `${value}，共七档` }}
          onChange={(index) => onChange(FONT_SIZES[index])}
          styles={{
            root: { paddingHorizontal: 0 },
            rail: { height: 1, backgroundColor: token.colorBorder },
            thumb: styles.thumb,
          }}
        />
      </ConfigProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  labels: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallA: { fontSize: 14, lineHeight: 24 },
  largeA: { fontSize: 26, lineHeight: 34 },
  standard: {
    position: 'absolute',
    left: '16.6667%',
    transform: [{ translateX: -14 }],
    fontSize: 14,
    lineHeight: 24,
  },
  thumb: {
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
})
