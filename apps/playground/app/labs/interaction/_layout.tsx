import { Stack } from 'expo-router/stack'
import { InteractionLabProvider } from '@/components/interaction-lab/interaction-lab-provider'

export default function InteractionLabLayout() {
  return (
    <InteractionLabProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </InteractionLabProvider>
  )
}
