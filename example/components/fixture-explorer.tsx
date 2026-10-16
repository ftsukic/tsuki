import { useState } from 'react'
import { useRouter } from 'expo-router'
import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Cell, Search, Segmented, Text, useToken } from '@ftsukic/tsuki'
import { componentCatalog } from '@/fixtures/catalog'
import { componentCategories } from '@/fixtures/categories'
import { useDemoTheme } from './demo-provider'

export default function FixtureExplorer() {
  const router = useRouter()
  const { token } = useToken()
  const { mode, setMode } = useDemoTheme()
  const [query, setQuery] = useState('')
  const keyword = query.trim().toLowerCase()
  const sections = componentCategories
    .map((category) => ({
      title: category.title,
      data: category.components.flatMap((id) => {
        const item = componentCatalog.find((entry) => entry.id === id)
        return item &&
          `${category.title} ${item.title} ${item.component} ${item.description}`
            .toLowerCase()
            .includes(keyword)
          ? [item]
          : []
      }),
    }))
    .filter((section) => section.data.length > 0)
  const resultCount = sections.reduce((count, section) => count + section.data.length, 0)
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: token.colorBgLayout }]}>
      <FlatList
        data={sections}
        keyExtractor={(section) => section.title}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={[styles.logo, { backgroundColor: token.colorPrimary }]}>
                <Text style={[styles.logoText, { color: token.colorTextLightSolid }]}>月</Text>
              </View>
              <View>
                <Text style={styles.brand}>TSUKI</Text>
                <Text style={{ color: token.colorTextSecondary }}>React Native UI</Text>
              </View>
            </View>
            <Text style={styles.title}>组件游乐场</Text>
            <Text style={[styles.description, { color: token.colorTextSecondary }]}>
              探索组件的样式、交互和组合方式。
            </Text>
            <Segmented
              block
              value={mode}
              options={[
                { label: '跟随系统', value: 'system' },
                { label: '浅色', value: 'light' },
                { label: '深色', value: 'dark' },
              ]}
              onChange={(value) => {
                if (value === 'system' || value === 'light' || value === 'dark') setMode(value)
              }}
            />
            <Cell.Group title="交互实验室" border={false} styles={{ body: styles.groupBody }}>
              <Cell
                title="字号设置"
                description="聊天预览 · 七档字号 · 全局生效"
                showArrow
                onPress={() => router.push('/labs/font-size')}
              />
              <Cell
                title="键盘与聊天"
                description="键盘联动 · 消息滚动 · 输入面板"
                showArrow
                onPress={() => router.push('/labs/keyboard-chat')}
              />
            </Cell.Group>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>全部组件</Text>
              <Text style={{ color: token.colorTextSecondary }}>
                {resultCount} / {componentCatalog.length}
              </Text>
            </View>
            <Search
              value={query}
              onChange={setQuery}
              placeholder="搜索组件名称或功能"
              accessibilityLabel="搜索组件"
              shape="round"
              background={token.colorBgLayout}
              style={{ paddingHorizontal: 0, paddingVertical: 0 }}
            />
          </View>
        }
        renderItem={({ item: section }) => (
          <Cell.Group
            title={section.title}
            extra={`${section.data.length} 个组件`}
            border={false}
            styles={{ body: styles.groupBody }}
          >
            {section.data.map((item) => (
              <Cell
                key={item.id}
                title={item.title}
                description={item.description}
                showArrow
                onPress={() =>
                  router.push({ pathname: '/components/[id]', params: { id: item.id } })
                }
              />
            ))}
          </Cell.Group>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.cardTitle}>没有找到组件</Text>
            <Text style={{ color: token.colorTextSecondary }}>试试其他名称或功能关键词。</Text>
          </View>
        }
        ListFooterComponent={
          <Text style={[styles.footer, { color: token.colorTextTertiary }]}>
            @ftsukic/tsuki · 为原生体验而造
          </Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, gap: 10 },
  header: { gap: 18, paddingBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  logo: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  brand: { fontSize: 17, lineHeight: 24, fontWeight: '800', letterSpacing: 3 },
  title: { fontSize: 34, lineHeight: 44, fontWeight: '700', marginTop: 8 },
  description: { fontSize: 15, lineHeight: 23 },
  groupBody: { borderRadius: 16, overflow: 'hidden' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  cardTitle: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 32, gap: 10 },
  footer: { textAlign: 'center', fontSize: 12, lineHeight: 18, paddingVertical: 24 },
})
