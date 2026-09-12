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
 * @title 受控 value
 * @description value 由外部状态维护，DateRangePicker 的草稿只在确认后回写。
 */
export default function DateRangePickerControlledExample() {
  const pickerRef = useRef<DateRangePickerRef>(null)
  const [value, setValue] = useState<DateRangePickerValue>([
    new Date(2026, 0, 31),
    new Date(2026, 1, 28),
  ])

  return (
    <View style={{ gap: 8 }}>
      <Button onPress={() => pickerRef.current?.open()}>编辑日期范围</Button>
      <Text>外部 value：{formatRange(value)}</Text>
      <DateRangePicker
        maxDate={new Date(2030, 11, 31)}
        minDate={new Date(2020, 0, 1)}
        onConfirm={setValue}
        ref={pickerRef}
        title="受控日期范围"
        value={value}
      />
    </View>
  )
}
