import { useState } from 'react'
import { FieldDateRangePicker } from '../../..'
import type { DateRangePickerValue } from '../../..'
import { View } from 'react-native'

const selectedRange: DateRangePickerValue = [new Date(2026, 8, 10), new Date(2026, 8, 20)]

/**
 * @title FieldDateRangePicker
 * @description FieldDateRangePicker 组合 Cell 和 DateRangePicker，空值显示双端点占位文案，确认后才提交范围。
 */
export default function FieldDateRangePickerFixture() {
  const [value, setValue] = useState<DateRangePickerValue | undefined>()
  const [controlledValue, setControlledValue] = useState(selectedRange)

  return (
    <View style={{ gap: 12 }}>
      <FieldDateRangePicker
        label="空值范围"
        onChange={setValue}
        placeholder={['开始日期', '结束日期']}
        value={value}
      />
      <FieldDateRangePicker
        label="已选择范围"
        defaultValue={selectedRange}
        placeholder={['开始日期', '结束日期']}
      />
      <FieldDateRangePicker
        label="受控范围"
        onChange={setControlledValue}
        value={controlledValue}
      />
      <FieldDateRangePicker
        label="边界范围"
        defaultValue={selectedRange}
        maxDate={new Date(2026, 8, 30)}
        minDate={new Date(2026, 8, 1)}
      />
      <FieldDateRangePicker defaultValue={selectedRange} label="垂直范围" vertical />
    </View>
  )
}
