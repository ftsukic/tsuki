import { lazy, Suspense, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { defaultAlgorithm, Provider } from '@ftsukic/tsuki'
import { componentCatalog } from '../fixtures/catalog'
import type { ComponentFixtureEntry } from '../fixtures/catalog'

const KeyboardChatScrollViewPage = lazy(() => import('../pages/keyboard-chat-scroll-view'))

export default function FixtureExplorer() {
  return (
    <Provider safeArea theme={{ algorithm: defaultAlgorithm }}>
      <Explorer />
    </Provider>
  )
}

function Explorer() {
  const [selected, setSelected] = useState<ComponentFixtureEntry | null>(null)
  const [showKeyboardChat, setShowKeyboardChat] = useState(false)

  if (showKeyboardChat) {
    return (
      <Suspense fallback={<Text style={styles.loading}>正在加载专项实验…</Text>}>
        <KeyboardChatScrollViewPage onBack={() => setShowKeyboardChat(false)} />
      </Suspense>
    )
  }

  if (selected) {
    return <PreviewScreen fixture={selected} onBack={() => setSelected(null)} />
  }

  return (
    <FixtureCatalog onOpenKeyboardChat={() => setShowKeyboardChat(true)} onSelect={setSelected} />
  )
}

function FixtureCatalog({
  onOpenKeyboardChat,
  onSelect,
}: {
  onOpenKeyboardChat: () => void
  onSelect: (component: ComponentFixtureEntry) => void
}) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>@ftsukic/tsuki</Text>
        <Text style={styles.title}>Components / 组件预览</Text>
        <Text style={styles.description} selectable>
          每个组件进入自己的 overview，examples 在 overview 内组织。
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onOpenKeyboardChat}
        style={({ pressed }) => [styles.specialCard, pressed && styles.fixtureCardPressed]}
      >
        <View style={styles.cardText}>
          <Text style={styles.specialEyebrow}>专项实验</Text>
          <Text style={styles.cardTitle}>KeyboardChatScrollView</Text>
          <Text style={styles.cardDescription} selectable>
            测试键盘抬升、interactive dismissal、sticky composer 和消息滚动。
          </Text>
        </View>
        <Text style={styles.chevron} accessibilityElementsHidden>
          ›
        </Text>
      </Pressable>
      <FlatList
        data={componentCatalog}
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
              <Text style={styles.cardDescription} selectable>
                {item.description}
              </Text>
            </View>
            <Text style={styles.chevron} accessibilityElementsHidden>
              ›
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>没有找到组件。</Text>}
      />
    </SafeAreaView>
  )
}

function PreviewScreen({
  fixture,
  onBack,
}: {
  fixture: ComponentFixtureEntry
  onBack: () => void
}) {
  const SelectedFixture = fixture.Component

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.previewHeader}>
        <Pressable
          accessibilityLabel="返回组件列表"
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
            {fixture.component}
          </Text>
        </View>
      </View>

      <View style={styles.previewViewport}>
        <View style={styles.fixtureViewport}>
          <SelectedFixture key={fixture.id} />
        </View>
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
  specialCard: {
    backgroundColor: '#eef6ff',
    borderColor: '#b2d4ff',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  specialEyebrow: {
    color: '#1677ff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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
  loading: {
    color: '#667085',
    padding: 24,
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
