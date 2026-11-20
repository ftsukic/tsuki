import { AccessibilityInfo } from 'react-native'
import { useSyncExternalStore } from 'react'

type Listener = () => void

const listeners = new Set<Listener>()
const noopUnsubscribe = () => {}
const noopSubscribe = (_listener: Listener) => noopUnsubscribe
let reducedMotionEnabled = false
let eventVersion = 0
let monitorGeneration = 0
let accessibilitySubscription: ReturnType<typeof AccessibilityInfo.addEventListener> | undefined

function getSnapshot(): boolean {
  return reducedMotionEnabled
}

function notifyListeners() {
  for (const listener of listeners) listener()
}

function setReducedMotionEnabled(value: boolean) {
  if (reducedMotionEnabled === value) return
  reducedMotionEnabled = value
  notifyListeners()
}

function handleReduceMotionChanged(value: boolean) {
  eventVersion += 1
  setReducedMotionEnabled(value)
}

function startMonitoring() {
  const generation = (monitorGeneration += 1)
  const requestEventVersion = eventVersion
  let initialState: Promise<boolean>

  // Subscribe before querying so a system change cannot fall into a gap.
  accessibilitySubscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    handleReduceMotionChanged,
  )

  try {
    initialState = AccessibilityInfo.isReduceMotionEnabled()
  } catch {
    initialState = Promise.resolve(false)
  }

  void initialState.then(
    (value) => {
      if (generation !== monitorGeneration || requestEventVersion !== eventVersion) return
      setReducedMotionEnabled(value)
    },
    () => {
      if (generation !== monitorGeneration || requestEventVersion !== eventVersion) return
      setReducedMotionEnabled(false)
    },
  )
}

function stopMonitoring() {
  monitorGeneration += 1
  accessibilitySubscription?.remove()
  accessibilitySubscription = undefined
  reducedMotionEnabled = false
  eventVersion = 0
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)

  if (listeners.size === 1) startMonitoring()

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stopMonitoring()
  }
}

export function useReducedMotion(active = true): boolean {
  const subscribeWhenActive = active ? subscribe : noopSubscribe
  const snapshot = useSyncExternalStore(subscribeWhenActive, getSnapshot, getSnapshot)

  return active && snapshot
}
