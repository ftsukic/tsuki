import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Basic from './examples/basic'
import Anchors from './examples/anchors'
import ContentDraggable from './examples/content-draggable'
import Magnetic from './examples/magnetic'
import Disabled from './examples/disabled'
import SafeArea from './examples/safe-area'
import Theme from './examples/theme'

const examples = [
  ['基础用法', Basic],
  ['自定义锚点', Anchors],
  ['仅拖动头部', ContentDraggable],
  ['关闭磁吸', Magnetic],
  ['禁用拖动', Disabled],
  ['底部安全区', SafeArea],
  ['主题定制', Theme],
] as const

/**
 * @title 组件预览
 */
export default function FloatingPanelOverview() {
  const [selected, setSelected] = useState(0)
  const Example = examples[selected][1]

  return (
    <View style={{ gap: 20, padding: 20, backgroundColor: '#f7f8fa' }}>
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>选择预览示例</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {examples.map(([title], index) => (
            <Pressable
              key={title}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === index }}
              onPress={() => setSelected(index)}
              style={{
                backgroundColor: selected === index ? '#1989fa' : '#ffffff',
                borderColor: '#d9e2ec',
                borderRadius: 8,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: selected === index ? '#ffffff' : '#1f2937', fontSize: 13 }}>
                {title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Example />
    </View>
  )
}
