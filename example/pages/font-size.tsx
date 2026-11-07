import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ConfigProvider, Text } from '@ftsukic/tsuki'
import { FontSizeSlider } from '@/components/font-size-slider'
import { toTsukiTheme, useAppTheme, useAppThemeSettings } from '@/theme'
import { resolveAppTheme } from '@/theme/resolve-app-theme'
import { useAppThemeDefinition } from '@/theme/use-app-theme'

export default function FontSizePage({ onBack }: { onBack: () => void }) {
  const theme = useAppTheme()
  const definition = useAppThemeDefinition()
  const { baseFontSize, setBaseFontSize } = useAppThemeSettings()
  const [draft, setDraft] = useState(baseFontSize)
  const previewTheme = resolveAppTheme(definition, { mode: theme.mode, baseFontSize: draft })
  const previewTsukiTheme = toTsukiTheme(previewTheme)

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.surface.page }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={8}>
          <Text
            style={[
              theme.typography.styles.label,
              styles.action,
              { color: theme.colors.text.link },
            ]}
          >
            取消
          </Text>
        </Pressable>
        <Text
          style={[
            theme.typography.styles.label,
            styles.title,
            { color: theme.colors.text.primary },
          ]}
        >
          设置字体大小
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setBaseFontSize(draft)
            onBack()
          }}
          style={[
            styles.done,
            {
              backgroundColor: theme.colors.status.success.foreground,
              borderRadius: theme.shape.radius.scale[theme.shape.radius.semantic.control],
            },
          ]}
        >
          <Text
            style={[
              theme.typography.styles.label,
              styles.action,
              { color: theme.colors.brand.onPrimary },
            ]}
          >
            完成
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.messages}>
        <ConfigProvider theme={previewTsukiTheme}>
          <View style={[styles.message, styles.outgoing]}>
            <View
              style={[styles.bubble, { backgroundColor: theme.colors.status.success.background }]}
            >
              <Text>预览字体大小</Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: theme.colors.brand.primary }]}>
              <Text style={[styles.avatarText, { color: theme.colors.brand.onPrimary }]}>我</Text>
            </View>
          </View>
          {[
            '拖动下面的滑块，可设置字体大小',
            '设置后，会改变 Example 中使用主题字号的组件。你可以返回组件页面，查看文字、按钮和输入框的显示效果。',
          ].map((message) => (
            <View key={message} style={styles.message}>
              <View
                style={[styles.avatar, { backgroundColor: theme.colors.status.success.foreground }]}
              >
                <Text style={[styles.avatarText, { color: theme.colors.brand.onPrimary }]}>月</Text>
              </View>
              <View style={[styles.bubble, { backgroundColor: theme.colors.surface.container }]}>
                <Text>{message}</Text>
              </View>
            </View>
          ))}
        </ConfigProvider>
      </ScrollView>
      <View style={[styles.controls, { backgroundColor: theme.colors.surface.container }]}>
        <FontSizeSlider value={draft} onChange={setDraft} />
        <Text
          style={[
            theme.typography.styles.caption,
            styles.hint,
            { color: theme.colors.text.secondary },
          ]}
        >
          当前字号 {draft} · 点击完成后生效
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  action: {},
  title: { fontWeight: '600' },
  done: { paddingHorizontal: 14, paddingVertical: 7 },
  messages: { paddingHorizontal: 12, paddingVertical: 24, gap: 16 },
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  outgoing: { justifyContent: 'flex-end' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '600' },
  bubble: {
    flexShrink: 1,
    maxWidth: '76%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
  },
  controls: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 24 },
  hint: { textAlign: 'center', marginTop: 8 },
})
