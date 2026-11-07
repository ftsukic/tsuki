import { StyleSheet, View } from 'react-native'
import { ConfigProvider, Slider, Text } from '@ftsukic/tsuki'
import { useAppTheme } from '@/theme'

const FONT_SIZES = [16, 18, 20, 24, 26, 28, 30]
const MARKS = Object.fromEntries(FONT_SIZES.map((_, index) => [index, null]))

export function FontSizeSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const theme = useAppTheme()
  return (
    <View>
      <View style={styles.labels}>
        <Text
          style={[
            {
              fontFamily: theme.typography.family.base,
              fontSize: theme.typography.size.sm,
              lineHeight: Math.round(theme.typography.size.sm * theme.typography.lineHeight.normal),
            },
          ]}
        >
          A
        </Text>
        <Text
          style={[
            theme.typography.styles.caption,
            styles.standard,
            { color: theme.colors.text.secondary },
          ]}
        >
          标准
        </Text>
        <Text
          style={[
            {
              fontFamily: theme.typography.family.base,
              fontSize: theme.typography.size['2xl'],
              lineHeight: Math.round(
                theme.typography.size['2xl'] * theme.typography.lineHeight.normal,
              ),
            },
          ]}
        >
          A
        </Text>
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
            rail: { height: 1, backgroundColor: theme.colors.border.default },
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
  standard: {
    position: 'absolute',
    left: '16.6667%',
    transform: [{ translateX: -14 }],
  },
  thumb: {
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
})
