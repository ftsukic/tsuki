import { useRef, useState } from 'react'
import { Button, DateRangePicker } from '@ftsukic/tsuki'
import type { DateRangePickerRef, DateRangePickerValue } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

function formatDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`
}

function formatRange(value: DateRangePickerValue) {
  return `${formatDate(value[0])} 至 ${formatDate(value[1])}`
}

/**
 * @title 日期边界
 * @description minDate 和 maxDate 限制整个范围，编辑开始日期时也不能超过当前结束日期。
 */
export default function DateRangePickerBoundsExample() {
  const pickerRef = useRef<DateRangePickerRef>(null)
  const [value, setValue] = useState<DateRangePickerValue>([
    new Date(2026, 8, 10),
    new Date(2026, 8, 20),
  ])

  return (
    <View style={{ gap: 8 }}>
      <Button onPress={() => pickerRef.current?.open()}>选择边界内范围</Button>
      <Text>已选择：{formatRange(value)}</Text>
      <DateRangePicker
        defaultValue={value}
        maxDate={new Date(2026, 8, 30)}
        minDate={new Date(2026, 8, 1)}
        onConfirm={setValue}
        ref={pickerRef}
        title="有效日期范围"
      />
    </View>
  )
}
