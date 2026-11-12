import { useRouter } from 'expo-router'
import KeyboardChatScrollViewPage from '@/pages/keyboard-chat-scroll-view'

export default function KeyboardChatScreen() {
  const router = useRouter()
  return (
    <KeyboardChatScrollViewPage
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  )
}
