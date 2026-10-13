import { Link, useIsFocused, useLocalSearchParams } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { PortalHost, Text, useToken } from '@ftsukic/tsuki'
import { componentCatalog } from '@/fixtures/catalog'

const PAGE_PORTAL_COMPONENTS = new Set(['floating-panel', 'floating-bubble'])

export default function ComponentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isFocused = useIsFocused()
  const { token } = useToken()
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
      {hasPagePortal ? (
        isFocused ? (
          <Preview key={fixture.id} />
        ) : null
      ) : (
        <Preview key={fixture.id} />
      )}
    </SafeAreaView>
  )
  return hasPagePortal ? (
    <SafeAreaProvider>{isFocused ? <PortalHost>{preview}</PortalHost> : preview}</SafeAreaProvider>
  ) : (
    preview
  )
}
