import { useState } from 'react'
import { Card, ConfigProvider, Text, useTsukiTheme } from '../../../../packages/tsuki/src'
import type { ThemeConfig } from '../../../../packages/tsuki/src'
import { Pressable, StyleSheet, View } from 'react-native'
import { V2ThemeVariables } from '../v2-preview'

export function NestedScopeSection() {
  const { scheme, semantic } = useTsukiTheme()
  const [updated, setUpdated] = useState(false)
  const parentTheme: ThemeConfig = updated
    ? {
        semantic: {
          colorPrimary: scheme === 'dark' ? '#a78bfa' : '#7c3aed',
          colorSurface: scheme === 'dark' ? '#312e81' : '#fffbeb',
        },
        components: { Card: { borderRadius: 24 } },
      }
    : {}
  const childTheme: ThemeConfig = {
    semantic: { colorPrimary: scheme === 'dark' ? '#fb7185' : '#e11d48' },
    components: { Card: { borderRadius: 8 } },
  }
  const resetTheme: ThemeConfig = {
    inherit: false,
    semantic: { colorPrimary: scheme === 'dark' ? '#60a5fa' : '#0284c7' },
  }

  return (
    <View style={styles.section} testID="nested-scope-section">
      <View style={styles.heading}>
        <Text style={styles.title}>Nested Theme Scopes</Text>
        <Text style={styles.description}>
          The child inherits the parent surface, then the inner scope resets inherited values with
          inherit=false.
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setUpdated((value) => !value)}
          style={[
            styles.action,
            { backgroundColor: semantic.colorSurface, borderColor: semantic.colorBorder },
          ]}
          testID="nested-dynamic-update"
        >
          <Text style={[styles.actionText, { color: semantic.colorForeground }]}>
            Update parent theme
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setUpdated(false)}
          style={[
            styles.action,
            { backgroundColor: semantic.colorSurface, borderColor: semantic.colorBorder },
          ]}
          testID="nested-reset-theme"
        >
          <Text style={[styles.actionText, { color: semantic.colorForeground }]}>
            Restore default theme
          </Text>
        </Pressable>
      </View>
      <ConfigProvider theme={parentTheme}>
        <V2ThemeVariables style={styles.scope}>
          <ScopeCard id="nested-parent" title="Parent theme" />
          <ConfigProvider theme={childTheme}>
            <V2ThemeVariables style={styles.scope}>
              <ScopeCard id="nested-child" title="Child override · inherits parent" />
              <ConfigProvider theme={resetTheme}>
                <V2ThemeVariables style={styles.scope}>
                  <ScopeCard id="nested-inherit-false" title="Inner scope · inherit=false" />
                </V2ThemeVariables>
              </ConfigProvider>
            </V2ThemeVariables>
          </ConfigProvider>
        </V2ThemeVariables>
      </ConfigProvider>
    </View>
  )
}

function ScopeCard({ id, title }: { id: string; title: string }) {
  const theme = useTsukiTheme()
  return (
    <Card testID={`${id}-card`}>
      <Card.Header>
        <Text>{title}</Text>
      </Card.Header>
      <Card.Body>
        <Text style={{ color: theme.semantic.colorPrimary }} testID={`${id}-primary`}>
          Primary: {theme.semantic.colorPrimary}
        </Text>
        <Text testID={`${id}-surface`}>Surface: {theme.semantic.colorSurface}</Text>
        <Text testID={`${id}-card-radius`}>
          Card radius: {theme.components.Card.borderRadius} dp
        </Text>
      </Card.Body>
    </Card>
  )
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { gap: 4 },
  title: { fontSize: 21, lineHeight: 28, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21, opacity: 0.72 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionText: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  scope: { gap: 10, padding: 8 },
})
