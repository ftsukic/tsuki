import { useState } from 'react'
import { Text, View } from 'react-native'
import { TimePicker } from '@ftsukic/tsuki'
import type { TimePickerValue } from '@ftsukic/tsuki'

/**
 * @title formatter 展示
 * @description formatter 增加单位后缀，但状态区域展示的 callback value 仍是 ["12","30"] 形式。
 */
export default function TimePickerFormatterExample() {
  const [value, setValue] = useState<TimePickerValue>(['12', '30'])

  return (
    <View style={{ gap: 8 }}>
      <TimePicker
        formatter={(type, option) => ({
          ...option,
          text: type === 'hour' ? `${option.text} 时` : `${option.text} 分`,
        })}
        onChange={setValue}
        value={value}
        title="格式化展示"
      />
      <Text>callback value：{JSON.stringify(value)}</Text>
    </View>
  )
}
