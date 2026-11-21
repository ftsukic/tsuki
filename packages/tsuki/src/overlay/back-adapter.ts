import { BackHandler, Platform } from 'react-native'

export type OverlayBackHandler = () => boolean

export function subscribeToOverlayBack(handler: OverlayBackHandler): () => void {
  const platform = Platform.OS as string
  if (platform !== 'android' && platform !== 'harmony') return () => {}

  const subscription = BackHandler.addEventListener('hardwareBackPress', handler)
  let active = true
  return () => {
    if (!active) return
    active = false
    subscription.remove()
  }
}
