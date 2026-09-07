import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { Provider } from '@ftsukic/tsuki'
import { fixtureCatalog } from '../fixtures/catalog'
import type { FixtureEntry } from '../fixtures/catalog'

export default function FixtureExplorer() {
  return (
    <SafeAreaProvider>
      <Explorer />
    </SafeAreaProvider>
  )
}

function Explorer() {
  const [selected, setSelected] = useState<FixtureEntry | null>(null)

  if (selected) {
    return <PreviewScreen fixture={selected} onBack={() => setSelected(null)} />
  }

  return <FixtureCatalog onSelect={setSelected} />
}

function FixtureCatalog({ onSelect }: { onSelect: (fixture: FixtureEntry) => void }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>@ftsukic/tsuki</Text>
        <Text style={styles.title}>Fixture Explorer</Text>
        <Text style={styles.description} selectable>
          从 src/**/__fixtures__ 生成的原生组件预览目录。
        </Text>
      </View>
      <FlatList
        data={fixtureCatalog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelect(item)}
            style={({ pressed }) => [styles.fixtureCard, pressed && styles.fixtureCardPressed]}
          >
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.component}</Text>
              <Text style={styles.cardDescription} selectable>
                {item.description}
              </Text>
            </View>
            <Text style={styles.chevron} accessibilityElementsHidden>
              ›
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>没有找到 fixture。</Text>}
      />
    </SafeAreaView>
  )
}

function PreviewScreen({ fixture, onBack }: { fixture: FixtureEntry; onBack: () => void }) {
  const SelectedFixture = fixture.Component

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.previewHeader}>
        <Pressable
          accessibilityLabel="返回 fixture 列表"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backLabel}>‹</Text>
        </Pressable>
        <View style={styles.previewTitleBlock}>
          <Text style={styles.previewTitle} numberOfLines={1}>
            {fixture.title}
          </Text>
          <Text style={styles.previewMeta} numberOfLines={1} selectable>
            {fixture.id}
          </Text>
        </View>
      </View>

      <View style={styles.previewViewport}>
        <Provider key={fixture.id}>
          <View style={styles.fixtureViewport}>
            <SelectedFixture />
          </View>
        </Provider>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  eyebrow: {
    color: '#1677ff',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#101828',
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
  },
  listContent: {
    gap: 12,
    padding: 20,
  },
  fixtureCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eaecf0',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  fixtureCardPressed: {
    opacity: 0.7,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
  },
  cardMeta: {
    color: '#1677ff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },
  chevron: {
    color: '#98a2b3',
    fontSize: 28,
    lineHeight: 28,
    paddingLeft: 12,
  },
  empty: {
    color: '#667085',
    padding: 20,
    textAlign: 'center',
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backLabel: {
    color: '#1677ff',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 36,
  },
  previewTitleBlock: {
    flex: 1,
    gap: 2,
  },
  previewTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '600',
  },
  previewMeta: {
    color: '#667085',
    fontSize: 12,
  },
  previewViewport: {
    flex: 1,
    minHeight: 0,
  },
  fixtureViewport: {
    flex: 1,
  },
})
