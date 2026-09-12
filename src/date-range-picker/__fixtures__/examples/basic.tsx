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
 * @title 基础日期范围
 * @description 通过开始时间和结束时间区域切换当前编辑端点，确认后保存完整日期范围。
 */
export default function DateRangePickerBasicExample() {
  const pickerRef = useRef<DateRangePickerRef>(null)
  const [value, setValue] = useState<DateRangePickerValue>([
    new Date(2026, 8, 10),
    new Date(2026, 8, 20),
  ])

  return (
    <View style={{ gap: 8 }}>
      <Button onPress={() => pickerRef.current?.open()}>选择日期范围</Button>
      <Text>已选择：{formatRange(value)}</Text>
      <DateRangePicker
        defaultValue={value}
        maxDate={new Date(2030, 11, 31)}
        minDate={new Date(2020, 0, 1)}
        onConfirm={setValue}
        ref={pickerRef}
        title="选择日期范围"
      />
    </View>
  )
}
