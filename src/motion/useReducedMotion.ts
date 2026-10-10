import { useCallback, useSyncExternalStore } from 'react'
import { AccessibilityInfo } from 'react-native'
import { useReducedMotionSnapshot } from './useReducedMotionSnapshot'

const listeners = new Set<() => void>()
let current: boolean | undefined
let connection = 0
let subscription: ReturnType<typeof AccessibilityInfo.addEventListener> | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    const id = ++connection
    let changed = false
    const update = (value: boolean) => {
      if (connection !== id) return
      current = value
      listeners.forEach((notify) => notify())
    }
    subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      changed = true
      update(value)
    })
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (!changed) update(value)
      },
      () => undefined,
    )
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      connection += 1
      subscription?.remove()
      subscription = undefined
      current = undefined
    }
  }
}

/** All consumers share one live accessibility subscription and initial query. */
export function useReducedMotion() {
  const initial = useReducedMotionSnapshot()
  const snapshot = useCallback(() => current ?? initial, [initial])
  return useSyncExternalStore(subscribe, snapshot, () => false)
}
