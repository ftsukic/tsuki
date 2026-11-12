import { useState } from 'react'
import { View } from 'react-native'
import { Slider, Text } from '../../..'

/**
 * @title Basic slider
 * @description 受控值、实时预览和操作完成事件。
 */
export default function BasicSliderExample() {
  const [value, setValue] = useState(30)
  const [completed, setCompleted] = useState(30)
  return (
    <View style={{ gap: 12 }}>
      <Text>
        当前 {value} · 完成 {completed}
      </Text>
      <Slider
        accessibilityLabel="音量"
        value={value}
        onChange={setValue}
        onChangeComplete={setCompleted}
      />
      <Slider accessibilityLabel="亮度" defaultValue={50} />
    </View>
  )
}
