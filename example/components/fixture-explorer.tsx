import { useState } from 'react'
import { useRouter } from 'expo-router'
import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Cell, Search, Segmented, Text } from '@ftsukic/tsuki'
import { componentCatalog } from '@/fixtures/catalog'
import { componentCategories } from '@/fixtures/categories'
import { useAppTheme, useAppThemeSettings } from '@/theme'

export default function FixtureExplorer() {
  const router = useRouter()
  const theme = useAppTheme()
  const { mode, setMode } = useAppThemeSettings()
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
  const groupBody = {
    ...styles.groupBody,
    borderRadius: theme.shape.radius.scale[theme.shape.radius.semantic.card],
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.surface.page }]}>
      <FlatList
        data={sections}
        keyExtractor={(section) => section.title}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            gap: theme.spacing.layout.item,
            paddingHorizontal: theme.spacing.layout.page.horizontal,
            paddingVertical: theme.spacing.layout.page.vertical,
          },
        ]}
        ListHeaderComponent={
          <View style={[styles.header, { gap: theme.spacing.layout.section }]}>
            <View style={[styles.brandRow, { gap: theme.spacing.layout.item }]}>
              <View
                style={[
                  styles.logo,
                  {
                    backgroundColor: theme.colors.brand.primary,
                    borderRadius: theme.shape.radius.scale[theme.shape.radius.semantic.card],
                  },
                ]}
              >
                <Text
                  style={[
                    {
                      color: theme.colors.brand.onPrimary,
                      fontSize: theme.typography.size['2xl'],
                      lineHeight: Math.round(
                        theme.typography.size['2xl'] * theme.typography.lineHeight.normal,
                      ),
                    },
                  ]}
                >
                  月
                </Text>
              </View>
              <View>
                <Text style={[theme.typography.styles.label, styles.brand]}>TSUKI</Text>
                <Text
                  style={[theme.typography.styles.caption, { color: theme.colors.text.secondary }]}
                >
                  React Native UI
                </Text>
              </View>
            </View>
            <Text className="!type-page-title !text-app-text-primary" style={styles.title}>
              组件游乐场
            </Text>
            <Text
              style={[theme.typography.styles.bodySmall, { color: theme.colors.text.secondary }]}
            >
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
            <Cell.Group title="交互实验室" border={false} styles={{ body: groupBody }}>
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
              <Text style={[theme.typography.styles.sectionTitle, styles.sectionTitle]}>
                全部组件
              </Text>
              <Text
                style={[theme.typography.styles.bodySmall, { color: theme.colors.text.secondary }]}
              >
                {resultCount} / {componentCatalog.length}
              </Text>
            </View>
            <Search
              value={query}
              onChange={setQuery}
              placeholder="搜索组件名称或功能"
              accessibilityLabel="搜索组件"
              shape="round"
              background={theme.colors.surface.page}
              style={{ paddingHorizontal: 0, paddingVertical: 0 }}
            />
          </View>
        }
        renderItem={({ item: section }) => (
          <Cell.Group
            title={section.title}
            extra={`${section.data.length} 个组件`}
            border={false}
            styles={{ body: groupBody }}
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
            <Text style={[theme.typography.styles.label, styles.cardTitle]}>没有找到组件</Text>
            <Text
              style={[theme.typography.styles.bodySmall, { color: theme.colors.text.secondary }]}
            >
              试试其他名称或功能关键词。
            </Text>
          </View>
        }
        ListFooterComponent={
          <Text
            style={[
              theme.typography.styles.caption,
              styles.footer,
              { color: theme.colors.text.tertiary },
            ]}
          >
            @ftsukic/tsuki · 为原生体验而造
          </Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { paddingBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  logo: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: '600' },
  brand: { fontWeight: '800', letterSpacing: 3 },
  title: { marginTop: 8 },
  groupBody: { overflow: 'hidden' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: { fontWeight: '700' },
  cardTitle: { fontWeight: '600' },
  empty: { alignItems: 'center', padding: 32, gap: 10 },
  footer: { textAlign: 'center', paddingVertical: 24 },
})
