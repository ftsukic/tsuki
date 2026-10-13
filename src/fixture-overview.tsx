import { useState } from 'react'
import type { ComponentType } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from './text'
import { useToken } from './theme'
import { useBackgroundScrollLocked } from './portal/useBackgroundScrollLocked'

export interface FixtureExampleEntry {
  Component: ComponentType
  description: string
  id: string
  title: string
}

const ALL_CONTENT_PADDING = 20

export interface FixtureOverviewProps {
  examples: readonly FixtureExampleEntry[]
  fullBleedExamples?: boolean
  mode?: 'all' | 'single'
}

export function FixtureOverview({
  examples,
  fullBleedExamples = false,
  mode = 'all',
}: FixtureOverviewProps) {
  const { token } = useToken()
  const backgroundScrollLocked = useBackgroundScrollLocked()
  const [selectedId, setSelectedId] = useState(examples[0]?.id ?? '')

  if (examples.length === 0) return null

  if (mode === 'single') {
    const selected = examples.find((example) => example.id === selectedId) ?? examples[0]
    const SelectedExample = selected.Component

    return (
      <View style={[styles.singleOverview, { backgroundColor: token.colorBgLayout }]}>
        <View style={styles.selectorHeader}>
          <Text style={[styles.selectorLabel, { color: token.colorText }]}>选择示例</Text>
          <ScrollView
            horizontal
            scrollEnabled={!backgroundScrollLocked}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorContent}
          >
            {examples.map((example) => {
              const isSelected = example.id === selected.id

              return (
                <Pressable
                  key={example.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedId(example.id)}
                  style={[
                    styles.selectorItem,
                    {
                      borderColor: isSelected ? token.colorPrimary : token.colorBorder,
                      backgroundColor: isSelected ? token.colorPrimary : token.colorBgContainer,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      { color: isSelected ? token.colorTextLightSolid : token.colorTextSecondary },
                      isSelected && styles.selectorTextSelected,
                    ]}
                  >
                    {example.title}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
          <Text
            style={[styles.selectedDescription, { color: token.colorTextSecondary }]}
            selectable
          >
            {selected.description}
          </Text>
        </View>
        <View style={styles.exampleViewport}>
          <SelectedExample key={selected.id} />
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      scrollEnabled={!backgroundScrollLocked}
      keyboardShouldPersistTaps="handled"
      style={[styles.allOverview, { backgroundColor: token.colorBgLayout }]}
      contentContainerStyle={styles.allContent}
    >
      {examples.map((example) => {
        const Example = example.Component

        return (
          <View key={example.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: token.colorText }]}>{example.title}</Text>
            <Text
              style={[styles.sectionDescription, { color: token.colorTextSecondary }]}
              selectable
            >
              {example.description}
            </Text>
            {fullBleedExamples ? (
              <View style={styles.fullBleedExample}>
                <Example key={example.id} />
              </View>
            ) : (
              <Example key={example.id} />
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  allContent: {
    gap: 28,
    padding: ALL_CONTENT_PADDING,
  },
  allOverview: {
    flex: 1,
  },
  exampleViewport: {
    flex: 1,
    minHeight: 0,
  },
  fullBleedExample: {
    marginHorizontal: -ALL_CONTENT_PADDING,
  },
  section: {
    gap: 12,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  selectedDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  selectorContent: {
    gap: 8,
  },
  selectorHeader: {
    gap: 10,
    padding: 16,
  },
  selectorItem: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectorText: {
    fontSize: 13,
  },
  selectorTextSelected: {
    fontWeight: '600',
  },
  singleOverview: {
    flex: 1,
    minHeight: 0,
  },
})
