import { Text } from '../../../../packages/tsuki/src'
import type { ResolvedTheme, SemanticTokens } from '../../../../packages/tsuki/src'
import { StyleSheet, View } from 'react-native'

interface SemanticSectionProps {
  currentTheme: ResolvedTheme
  lightTheme: ResolvedTheme | null
  darkTheme: ResolvedTheme | null
}

const semanticNames: (keyof SemanticTokens)[] = [
  'colorPrimary',
  'colorPrimaryForeground',
  'colorSuccess',
  'colorWarning',
  'colorDanger',
  'colorForeground',
  'colorMuted',
  'colorBackground',
  'colorSurface',
  'colorBorder',
]

export function SemanticSection({ currentTheme, lightTheme, darkTheme }: SemanticSectionProps) {
  return (
    <View style={styles.section} testID="semantic-token-section">
      <View style={styles.heading}>
        <Text style={styles.title}>Semantic Tokens</Text>
        <Text style={styles.description}>Resolved values for the current appearance.</Text>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendItem}>Current · {currentTheme.scheme}</Text>
        <Text style={styles.legendItem}>Light / Dark defaults</Text>
      </View>
      <View style={styles.tokens}>
        {semanticNames.map((name) => (
          <View
            key={name}
            style={[
              styles.token,
              {
                backgroundColor: currentTheme.semantic.colorSurface,
                borderColor: currentTheme.semantic.colorBorder,
              },
            ]}
            testID={`semantic-token-${name}`}
          >
            <View style={styles.currentRow}>
              <Text style={styles.tokenName}>{name}</Text>
              <ColorValue
                label="Current"
                value={currentTheme.semantic[name]}
                testID={`semantic-current-${name}`}
              />
            </View>
            <View style={styles.comparisonRow}>
              <ColorValue
                label="Light"
                value={lightTheme?.semantic[name] ?? 'Loading'}
                testID={`semantic-light-${name}`}
              />
              <ColorValue
                label="Dark"
                value={darkTheme?.semantic[name] ?? 'Loading'}
                testID={`semantic-dark-${name}`}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

function ColorValue({ label, value, testID }: { label: string; value: string; testID: string }) {
  const isColor = /^#[0-9a-f]{6}$/i.test(value)
  return (
    <View style={styles.colorValue} testID={testID}>
      <View
        style={[styles.swatch, isColor ? { backgroundColor: value } : styles.swatchPending]}
        accessibilityLabel={`${label} color ${value}`}
      />
      <Text style={styles.colorText}>
        {label} {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { gap: 4 },
  title: { fontSize: 21, lineHeight: 28, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21, opacity: 0.72 },
  legend: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  legendItem: { fontSize: 12, lineHeight: 18, opacity: 0.72 },
  tokens: { gap: 8 },
  token: { gap: 10, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12 },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tokenName: { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#64748b',
  },
  swatchPending: { backgroundColor: '#94a3b8' },
  colorText: { fontSize: 12, lineHeight: 18, fontVariant: ['tabular-nums'] },
})
