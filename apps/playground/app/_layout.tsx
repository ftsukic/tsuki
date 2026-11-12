import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { StatusBar, View } from 'react-native'
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
  const baseTheme = dark ? DarkTheme : DefaultTheme
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: token.colorPrimary,
      background: token.colorBgLayout,
      card: token.colorBgContainer,
      text: token.colorText,
      border: token.colorBorder,
      notification: token.colorError,
    },
  }
  return (
    <ThemeProvider value={navigationTheme}>
      <View style={{ flex: 1, backgroundColor: token.colorBgLayout }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: token.colorBgContainer },
            headerTintColor: token.colorText,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: token.colorBgLayout },
          }}
        >
          <Stack.Screen name="labs/shared-transition" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="components/[id]" options={{ title: '组件预览' }} />
          <Stack.Screen
            name="labs/font-size"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen name="labs/keyboard-chat" options={{ headerShown: false }} />
        </Stack>
      </View>
    </ThemeProvider>
  )
}
