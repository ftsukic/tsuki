import { StyleSheet, View } from 'react-native'
import { Text, useToken } from '@ftsukic/tsuki'

export function ValueDisplay({ label, value }: { label: string; value: string | number }) {
  const { token } = useToken()

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: token.colorTextSecondary }]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 12, lineHeight: 18 },
  value: { flexShrink: 1, textAlign: 'right', fontSize: 12, lineHeight: 18, fontWeight: '600' },
})
