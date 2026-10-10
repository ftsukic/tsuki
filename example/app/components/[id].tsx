import { Link, useLocalSearchParams } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, useToken } from '@ftsukic/tsuki'
import { componentCatalog } from '@/fixtures/catalog'

export default function ComponentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
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
  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: token.colorBgLayout }}
    >
      <Stack.Screen options={{ title: fixture.title }} />
      <Preview key={fixture.id} />
    </SafeAreaView>
  )
}
