import { Picker } from '@ftsukic/tsuki'
import { View } from 'react-native'

const options = [
  { text: '上午', value: 'am' },
  { text: '下午', value: 'pm' },
  { text: '晚上', value: 'night' },
]

/**
 * @title 无 toolbar Picker
 * @description Picker 独立渲染纯滚轮，可嵌入自定义容器或 Popup。
 */
export default function PickerWheelExample() {
  return (
    <View>
      <Picker columns={options} defaultValue={['pm']} showToolbar={false} />
    </View>
  )
}
