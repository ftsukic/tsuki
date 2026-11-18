import { Picker } from '@ftsukic/tsuki'
import { View } from 'react-native'

const options = [
  { text: '第一项', value: 1 },
  { text: '第二项', value: 2 },
  { text: '第三项', value: 3 },
  { text: '第四项', value: 4 },
]

/**
 * @title 自定义 itemHeight
 * @description 使用较大的行高和三行视口展示 Picker。
 */
export default function PickerItemHeightExample() {
  return (
    <View>
      <Picker
        columns={options}
        defaultValue={[2]}
        itemHeight={52}
        showToolbar={false}
        visibleItemCount={3}
      />
    </View>
  )
}
