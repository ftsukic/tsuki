import { Link, useIsFocused, useLocalSearchParams } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { Keyboard, Platform, StyleSheet, View } from 'react-native'
import { useEffect, useState } from 'react'
import { KeyboardToolbar } from 'react-native-keyboard-controller'
import { FixtureKeyboardToolbarContext } from '../../../src/input/__fixtures__/keyboard-toolbar-context'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Portal, PortalHost, Text, useToken } from '@ftsukic/tsuki'
import { componentCatalog } from '@/fixtures/catalog'

const TOOLBAR_COMPONENTS = new Set(['input', 'dialog', 'popup', 'portal'])

const PAGE_PORTAL_COMPONENTS = new Set(['floating-panel', 'floating-bubble'])

export default function ComponentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isFocused = useIsFocused()
  const { token } = useToken()
  const [toolbarHeight, setToolbarHeight] = useState(42)
  const [keyboardVisible, setKeyboardVisible] = useState(Keyboard.isVisible())
  const hasToolbar = Platform.OS === 'ios' && isFocused && TOOLBAR_COMPONENTS.has(id)
  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true)),
      Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false)),
    ]
    return () => subscriptions.forEach((subscription) => subscription.remove())
  }, [])
  const fixture = componentCatalog.find((entry) => entry.id === id)
  if (!fixture)
    return (
      <View style={{ padding: 24, gap: 16 }}>
        <Stack.Screen options={{ title: '未找到组件' }} />
        <Text>该组件不存在。</Text>
        <Link href="/">返回组件列表</Link>
      </View>
    )
  const Preview = fixture.Component
  const hasPagePortal = PAGE_PORTAL_COMPONENTS.has(fixture.id)
  const preview = (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: token.colorBgLayout }}
    >
      <Stack.Screen options={{ title: fixture.title }} />
      <FixtureKeyboardToolbarContext.Provider
        value={hasToolbar && keyboardVisible ? toolbarHeight : 0}
      >
        {hasPagePortal ? (
          isFocused ? (
            <Preview key={fixture.id} />
          ) : null
        ) : (
          <Preview key={fixture.id} />
        )}
        {fixture.id === 'image-preview' ? (
          <>
            <Link href="/labs/media-chat" style={{ padding: 16 }}>
              图片与视频混合聊天 →
            </Link>
            <Link href="/labs/fast-image-chat" style={{ padding: 16 }}>
              FastImage 聊天图片 · 300 张 →
            </Link>
            <Link href="/labs/fast-image-original" style={{ padding: 16 }}>
              FastImage 查看原图 →
            </Link>
            <Link href="/labs/fast-image-preview" style={{ padding: 16 }}>
              FastImage 组合示例 →
            </Link>
            <Link href="/labs/shared-transition" style={{ padding: 16 }}>
              测试跨页面图片预览与来源定位 →
            </Link>
          </>
        ) : null}
      </FixtureKeyboardToolbarContext.Provider>
      {hasToolbar && keyboardVisible ? (
        <Portal>
          <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 10000 }]}>
            <KeyboardToolbar
              onLayout={(event) => setToolbarHeight(event.nativeEvent.layout.height)}
            >
              <KeyboardToolbar.Prev />
              <KeyboardToolbar.Next />
              <KeyboardToolbar.Done text="完成" />
            </KeyboardToolbar>
          </View>
        </Portal>
      ) : null}
    </SafeAreaView>
  )
  return hasPagePortal ? (
    <SafeAreaProvider>{isFocused ? <PortalHost>{preview}</PortalHost> : preview}</SafeAreaProvider>
  ) : (
    preview
  )
}
