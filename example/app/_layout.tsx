import { Stack } from 'expo-router/stack'
import { StatusBar } from 'react-native'
import { useToken } from '@ftsukic/tsuki'
import { DemoProvider, useDemoTheme } from '@/components/demo-provider'

export const unstable_settings = { initialRouteName: 'index' }

export default function RootLayout() {
  return (
    <DemoProvider>
      <DemoStack />
    </DemoProvider>
  )
}

function DemoStack() {
  const { token } = useToken()
  const { dark } = useDemoTheme()
  return (
    <>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: token.colorBgContainer },
          headerTintColor: token.colorText,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: token.colorBgLayout },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="components/[id]" options={{ title: '组件预览' }} />
        <Stack.Screen name="labs/keyboard-chat" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}
