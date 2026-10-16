import { View } from 'react-native'
import { ConfigProvider, Slider, Text } from '../../..'

/**
 * @title Theme and custom thumb
 * @description 组件 token、语义样式及自定义滑块内容。
 */
export default function SliderThemeExample() {
  return (
    <ConfigProvider theme={{ components: { Slider: { thumbSize: 32, railHeight: 4 } } }}>
      <View style={{ padding: 16 }}>
        <Slider
          accessibilityLabel="自定义进度"
          defaultValue={50}
          step={10}
          renderThumb={({ value }) => <Text style={{ fontSize: 10, lineHeight: 14 }}>{value}</Text>}
          styles={({ state }) => ({
            thumb: {
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: state.dragging ? '#07c160' : '#1989fa',
            },
            track: { backgroundColor: '#07c160' },
          })}
        />
      </View>
    </ConfigProvider>
  )
}
