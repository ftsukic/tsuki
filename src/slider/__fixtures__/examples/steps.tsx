import { useState } from 'react'
import { View } from 'react-native'
import { Slider, Text } from '../../..'

/**
 * @title Steps and marks
 * @description 步长吸附、刻度标签与反向滑动。
 */
export default function StepsSliderExample() {
  const [value, setValue] = useState(2)
  return (
    <View style={{ gap: 16 }}>
      <Text>当前档位 {value}</Text>
      <Slider
        accessibilityLabel="档位"
        min={0}
        max={6}
        step={1}
        value={value}
        onChange={setValue}
        included={false}
        marks={{ 0: '小', 1: '标准', 3: '大', 6: '特大' }}
      />
      <Slider
        accessibilityLabel="反向进度"
        reverse
        defaultValue={40}
        step={10}
        marks={{ 0: '0', 50: '50', 100: '100' }}
      />
    </View>
  )
}
