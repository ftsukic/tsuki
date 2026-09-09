import { PickerView } from '@ftsukic/tsuki'
import { View } from 'react-native'

const options = [
  { text: '上午', value: 'am' },
  { text: '下午', value: 'pm' },
  { text: '晚上', value: 'night' },
]

/**
 * @title 无 toolbar PickerView
 * @description PickerView 独立渲染纯滚轮，可嵌入自定义容器或 Popup。
 */
export default function PickerViewExample() {
  return (
    <View>
      <PickerView columns={options} defaultValue={['pm']} />
    </View>
  )
}
