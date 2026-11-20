import { Pressable, StyleSheet, View } from 'react-native'
import { Text, useToken } from '@ftsukic/tsuki'

export interface ChoiceOption<Value extends string | number> {
  label: string
  value: Value
}

export function ChoiceControl<Value extends string | number>({
  label,
  value,
  options,
  onChange,
  testID,
}: {
  label: string
  value: Value
  options: readonly ChoiceOption<Value>[]
  onChange: (value: Value) => void
  testID: string
}) {
  const { token } = useToken()

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const active = value === option.value
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: active ? token.colorPrimary : token.colorBgLayout,
                  borderColor: active ? token.colorPrimary : token.colorBorder,
                },
              ]}
              testID={testID + '-' + String(option.value).replace('.', '-')}
            >
              <Text style={{ color: active ? token.colorTextLightSolid : token.colorText }}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
})
