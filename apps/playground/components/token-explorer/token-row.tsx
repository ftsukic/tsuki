import { useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import { Text, useTsukiTheme } from '../../../../packages/tsuki/src'
import { Pressable, StyleSheet, View } from 'react-native'
import type { TokenDetail } from './token-types'

export function TokenRow({ token, sectionID }: { token: TokenDetail; sectionID: string }) {
  const { semantic } = useTsukiTheme()
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | null>(null)
  const swatchColor = token.color ?? token.currentValue
  const isColor = /^#[0-9a-f]{6}$/i.test(swatchColor)

  async function copyTokenName() {
    try {
      setCopyStatus((await Clipboard.setStringAsync(token.name)) ? 'copied' : 'failed')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: semantic.colorSurface, borderColor: semantic.colorBorder },
      ]}
      testID={`token-row-${sectionID}-${token.name}`}
    >
      <View style={styles.main}>
        <View style={styles.identity}>
          {isColor && (
            <View
              style={[
                styles.swatch,
                { backgroundColor: swatchColor, borderColor: semantic.colorBorder },
              ]}
              accessibilityLabel={`${token.name} swatch ${swatchColor}`}
            />
          )}
          <View style={styles.names}>
            <Text style={styles.name}>{token.name}</Text>
            <Text style={[styles.category, { color: semantic.colorMuted }]}>{token.category}</Text>
          </View>
        </View>
        <Text style={styles.currentValue}>Current: {token.currentValue}</Text>
      </View>
      <View style={styles.comparison}>
        <Text style={styles.comparisonText}>Light: {token.lightValue}</Text>
        <Text style={styles.comparisonText}>Dark: {token.darkValue}</Text>
        <Pressable
          accessibilityLabel={`Copy token name ${token.name}`}
          accessibilityRole="button"
          onPress={copyTokenName}
          style={[
            styles.copyButton,
            { backgroundColor: semantic.colorBackground, borderColor: semantic.colorBorder },
          ]}
          testID={`copy-token-${sectionID}-${token.name.replace(/[^a-zA-Z0-9-]/g, '-')}`}
        >
          <Text style={styles.copyLabel}>
            {copyStatus === 'copied'
              ? 'Copied'
              : copyStatus === 'failed'
                ? 'Copy failed'
                : 'Copy name'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { gap: 10, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12 },
  main: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  names: { gap: 2, flexShrink: 1 },
  swatch: { width: 24, height: 24, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth },
  name: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  category: { fontSize: 11, lineHeight: 16 },
  currentValue: { fontSize: 13, lineHeight: 18, fontVariant: ['tabular-nums'] },
  comparison: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  comparisonText: { fontSize: 12, lineHeight: 18, fontVariant: ['tabular-nums'] },
  copyButton: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  copyLabel: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
})
