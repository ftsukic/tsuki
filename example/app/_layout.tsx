import '../global.css'
import { ThemeProvider } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { StatusBar, View } from 'react-native'
import { DemoProvider } from '@/components/demo-provider'
import { toNavigationTheme, useAppTheme } from '@/theme'

export const unstable_settings = { initialRouteName: 'index' }

export default function RootLayout() {
  return (
    <DemoProvider>
      <DemoStack />
    </DemoProvider>
  )
}

function DemoStack() {
  const theme = useAppTheme()
  const navigationTheme = toNavigationTheme(theme)
  return (
    <ThemeProvider value={navigationTheme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.surface.page }}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
        <Stack
          screenOptions={{
            animation: 'ios_from_right',
            headerStyle: { backgroundColor: theme.colors.surface.container },
            headerTintColor: theme.colors.text.primary,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.colors.surface.page },
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
