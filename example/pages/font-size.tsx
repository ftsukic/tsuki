import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ConfigProvider, Text, useToken } from '@ftsukic/tsuki'
import { FontSizeSlider } from '@/components/font-size-slider'
import { useDemoTheme } from '@/components/demo-provider'

export default function FontSizePage({ onBack }: { onBack: () => void }) {
  const { token } = useToken()
  const { fontSize, setFontSize } = useDemoTheme()
  const [draft, setDraft] = useState(fontSize)

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: token.colorBgLayout }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={8}>
          <Text style={styles.action}>取消</Text>
        </Pressable>
        <Text style={styles.title}>设置字体大小</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setFontSize(draft)
            onBack()
          }}
          style={[styles.done, { backgroundColor: token.colorSuccess }]}
        >
          <Text style={[styles.action, { color: token.colorTextLightSolid }]}>完成</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.messages}>
        <ConfigProvider theme={{ seed: { fontSize: draft } }}>
          <View style={[styles.message, styles.outgoing]}>
            <View style={[styles.bubble, { backgroundColor: token.colorSuccessBg }]}>
              <Text>预览字体大小</Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: token.colorPrimary }]}>
              <Text style={styles.avatarText}>我</Text>
            </View>
          </View>
          {[
            '拖动下面的滑块，可设置字体大小',
            '设置后，会改变 Example 中使用主题字号的组件。你可以返回组件页面，查看文字、按钮和输入框的显示效果。',
          ].map((message) => (
            <View key={message} style={styles.message}>
              <View style={[styles.avatar, { backgroundColor: token.colorSuccess }]}>
                <Text style={styles.avatarText}>月</Text>
              </View>
              <View style={[styles.bubble, { backgroundColor: token.colorBgContainer }]}>
                <Text>{message}</Text>
              </View>
            </View>
          ))}
        </ConfigProvider>
      </ScrollView>
      <View style={[styles.controls, { backgroundColor: token.colorBgContainer }]}>
        <FontSizeSlider value={draft} onChange={setDraft} />
        <Text style={[styles.hint, { color: token.colorTextSecondary }]}>
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
  action: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  done: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6 },
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
  avatarText: { fontSize: 18, lineHeight: 24, color: '#fff', fontWeight: '600' },
  bubble: {
    flexShrink: 1,
    maxWidth: '76%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
  },
  controls: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 24 },
  hint: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 8 },
})
