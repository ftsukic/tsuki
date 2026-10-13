import { useSyncExternalStore } from 'react'
import { AccessibilityInfo } from 'react-native'

const listeners = new Set<() => void>()
let enabled: boolean | undefined
let revision = 0

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    const current = ++revision
    let changed = false
    const update = (value: boolean) => {
      if (current !== revision) return
      enabled = value
      listeners.forEach((notify) => notify())
    }
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (value) => {
      changed = true
      update(value)
    })
    void AccessibilityInfo.isScreenReaderEnabled().then(
      (value) => {
        if (!changed) update(value)
      },
      () => {
        if (!changed) update(true)
      },
    )
    disconnectCurrent = () => subscription.remove()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      revision += 1
      disconnectCurrent?.()
      disconnectCurrent = undefined
      enabled = undefined
    }
  }
}

let disconnectCurrent: (() => void) | undefined

// Long columns wait for this query before choosing an accessible render mode.
export function useScreenReader() {
  return useSyncExternalStore(
    subscribe,
    () => enabled,
    () => false,
  )
}
