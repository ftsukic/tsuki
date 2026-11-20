import { Pressable, StyleSheet, View } from 'react-native'
import { Text, useToken } from '@ftsukic/tsuki'

interface ParameterControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  decimals?: number
  suffix?: string
}

export function ParameterControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  decimals = 0,
  suffix = '',
}: ParameterControlProps) {
  const { token } = useToken()
  const adjust = (direction: -1 | 1) => {
    const next = Math.min(max, Math.max(min, Number((value + step * direction).toFixed(4))))
    onChange(next)
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={'Decrease ' + label}
          accessibilityRole="button"
          disabled={value <= min}
          onPress={() => adjust(-1)}
          style={[
            styles.stepButton,
            { backgroundColor: token.colorBgLayout },
            value <= min && styles.disabled,
          ]}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.value}>
          {value.toFixed(decimals)}
          {suffix}
        </Text>
        <Pressable
          accessibilityLabel={'Increase ' + label}
          accessibilityRole="button"
          disabled={value >= max}
          onPress={() => adjust(1)}
          style={[
            styles.stepButton,
            { backgroundColor: token.colorBgLayout },
            value >= max && styles.disabled,
          ]}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 19, lineHeight: 22, fontWeight: '600' },
  value: {
    minWidth: 68,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontVariant: ['tabular-nums'],
  },
  disabled: { opacity: 0.4 },
})
