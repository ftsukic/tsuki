import { router } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { SharedNavigationProvider } from '../../../../src/image-preview/__fixtures__/examples/navigation'

export default function SharedTransitionLayout() {
  return (
    <SharedNavigationProvider
      onNavigate={() => router.push('/labs/shared-transition/detail')}
      onReturn={() => router.back()}
    >
      <Stack screenOptions={{ headerShown: false, animation: 'none', gestureEnabled: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="detail" options={{ presentation: 'transparentModal' }} />
      </Stack>
    </SharedNavigationProvider>
  )
}
