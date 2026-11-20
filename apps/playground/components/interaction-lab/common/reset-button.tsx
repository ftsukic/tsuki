import { Pressable, StyleSheet } from 'react-native'
import { Text, useToken } from '@ftsukic/tsuki'

export function ResetButton({ onPress, label = 'Reset' }: { onPress: () => void; label?: string }) {
  const { token } = useToken()

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, { backgroundColor: token.colorPrimary }]}
    >
      <Text style={[styles.label, { color: token.colorTextLightSolid }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 13,
  },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
})
