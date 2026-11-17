import { Link, useIsFocused, useLocalSearchParams } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { Keyboard, Platform, StyleSheet, View } from 'react-native'
import { useEffect, useState } from 'react'
import { KeyboardToolbar } from 'react-native-keyboard-controller'
import { FixtureKeyboardToolbarContext } from '../../../../packages/tsuki/src/input/__fixtures__/keyboard-toolbar-context'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Text, useToken } from '@ftsukic/tsuki'
import { Portal, PortalHost } from 'react-native-teleport'
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
      </FixtureKeyboardToolbarContext.Provider>
      {hasToolbar && keyboardVisible ? (
        <Portal hostName="root">
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
  if (!hasPagePortal) return preview

  const pageScopedPreview =
    fixture.id === 'floating-panel' ? (
      <View style={{ flex: 1 }}>
        {preview}
        <PortalHost name="floating-panel-tabs" style={StyleSheet.absoluteFill} />
      </View>
    ) : (
      preview
    )

  return <SafeAreaProvider>{isFocused ? pageScopedPreview : null}</SafeAreaProvider>
}
