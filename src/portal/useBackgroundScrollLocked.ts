import { useContext, useSyncExternalStore } from 'react'
import { BackgroundScrollLockContext } from './scroll-lock'

const subscribeNone = () => () => undefined
const unlocked = () => false

/** Connect a background ScrollView/FlatList's scrollEnabled to the current TsukiProvider. */
export function useBackgroundScrollLocked(): boolean {
  const store = useContext(BackgroundScrollLockContext)
  return useSyncExternalStore(
    store?.subscribe ?? subscribeNone,
    store?.getSnapshot ?? unlocked,
    unlocked,
  )
}
