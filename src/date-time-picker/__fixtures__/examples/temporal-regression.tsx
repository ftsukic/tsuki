import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { DatePicker } from '../../../date-picker'
import { DateTimePicker } from '../../index'
import { Text } from '../../../text'
import { TimePicker } from '../../../time-picker'

/** @title Temporal picker regression @description 在同一页面手测三种 picker 的联动和 dependent column 同步。 */
export default function TemporalRegressionExample() {
  const [date, setDate] = useState(new Date(2026, 2, 31))
  const [time, setTime] = useState<readonly string[]>(['10', '20'])
  const [dateTime, setDateTime] = useState(new Date(2026, 2, 31, 10, 20, 0))

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <Text style={styles.title}>DatePicker · 2026-03-31</Text>
        <DatePicker
          defaultValue={new Date(2026, 2, 31)}
          maxDate={new Date(2026, 11, 31)}
          minDate={new Date(2026, 0, 1)}
          onChange={setDate}
          showToolbar={false}
        />
        <Text style={styles.value}>{formatDate(date)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>TimePicker · 10:20</Text>
        <TimePicker defaultValue={['10', '20']} onChange={setTime} showToolbar={false} />
        <Text style={styles.value}>{time.join(':')}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>DateTimePicker · 2026-03-31 10:20</Text>
        <DateTimePicker
          defaultValue={new Date(2026, 2, 31, 10, 20, 0)}
          maxDate={new Date(2026, 11, 31, 23, 59, 59)}
          minDate={new Date(2026, 0, 1)}
          onChange={setDateTime}
          showToolbar={false}
        />
        <Text style={styles.value}>{formatDateTime(dateTime)}</Text>
      </View>
    </View>
  )
}

function formatDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function formatDateTime(value: Date) {
  return `${formatDate(value)} ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
}

const styles = StyleSheet.create({
  root: { gap: 20, padding: 16 },
  section: { gap: 8 },
  title: { fontSize: 15, fontWeight: '600' },
  value: { color: '#667085', fontSize: 13 },
})
