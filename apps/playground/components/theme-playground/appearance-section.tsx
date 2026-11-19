import { Segmented } from '@ftsukic/tsuki'
import { Text } from '../../../../packages/tsuki/src'
import type { ThemeScheme } from '../../../../packages/tsuki/src'
import { StyleSheet, View } from 'react-native'

export type AppearanceMode = 'system' | ThemeScheme

interface AppearanceSectionProps {
  mode: AppearanceMode
  scheme: ThemeScheme
  onChange: (mode: AppearanceMode) => void
}

export function AppearanceSection({ mode, scheme, onChange }: AppearanceSectionProps) {
  return (
    <View style={styles.section} testID="appearance-section">
      <Text style={styles.title}>Appearance</Text>
      <Text style={styles.description}>
        System, Light, and Dark update the v1 and v2 Playground previews together.
      </Text>
      <Segmented
        block
        value={mode}
        options={[
          { label: 'System', value: 'system' },
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        onChange={(value) => {
          if (value === 'system' || value === 'light' || value === 'dark') onChange(value)
        }}
      />
      <Text style={styles.current} testID="appearance-current-scheme">
        Current preview: {scheme}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  title: { fontSize: 21, lineHeight: 28, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21, opacity: 0.72 },
  current: { fontSize: 13, lineHeight: 20, opacity: 0.72 },
})
