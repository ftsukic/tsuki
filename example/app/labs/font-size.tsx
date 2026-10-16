import { useRouter } from 'expo-router'
import FontSizePage from '@/pages/font-size'

export default function FontSizeScreen() {
  const router = useRouter()
  return <FontSizePage onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
}
