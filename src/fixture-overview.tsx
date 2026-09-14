import { useState } from 'react'
import type { ComponentType } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from './text'

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
  const [selectedId, setSelectedId] = useState(examples[0]?.id ?? '')

  if (examples.length === 0) return null

  if (mode === 'single') {
    const selected = examples.find((example) => example.id === selectedId) ?? examples[0]
    const SelectedExample = selected.Component

    return (
      <View style={styles.singleOverview}>
        <View style={styles.selectorHeader}>
          <Text style={styles.selectorLabel}>选择示例</Text>
          <ScrollView
            horizontal
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
                  style={[styles.selectorItem, isSelected && styles.selectorItemSelected]}
                >
                  <Text style={[styles.selectorText, isSelected && styles.selectorTextSelected]}>
                    {example.title}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
          <Text style={styles.selectedDescription} selectable>
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
      keyboardShouldPersistTaps="handled"
      style={styles.allOverview}
      contentContainerStyle={styles.allContent}
    >
      {examples.map((example) => {
        const Example = example.Component

        return (
          <View key={example.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{example.title}</Text>
            <Text style={styles.sectionDescription} selectable>
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
    backgroundColor: '#f7f8fa',
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
    color: '#68788d',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    color: '#344054',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDescription: {
    color: '#68788d',
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
    borderColor: '#d0d5dd',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectorItemSelected: {
    backgroundColor: '#1677ff',
    borderColor: '#1677ff',
  },
  selectorLabel: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
  },
  selectorText: {
    color: '#475467',
    fontSize: 13,
  },
  selectorTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  singleOverview: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#f7f8fa',
  },
})
