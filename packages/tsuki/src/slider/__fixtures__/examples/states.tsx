import { View } from 'react-native'
import { Slider, Text } from '../../..'

/**
 * @title Disabled and readonly
 * @description 禁用降低透明度，只读保留正常外观；均不可修改。
 */
export default function SliderStatesExample() {
  return (
    <View style={{ gap: 12 }}>
      <Text>禁用</Text>
      <Slider accessibilityLabel="禁用进度" defaultValue={40} disabled />
      <Text>只读</Text>
      <Slider accessibilityLabel="只读进度" value={60} readonly />
    </View>
  )
}
