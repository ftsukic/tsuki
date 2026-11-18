import { useEffect, useRef, useSyncExternalStore } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'
import type { PortalKey } from './types'
import { TeleportPortal } from './teleport-portal'
export type { PortalKey } from './types'

interface Entry {
  key: PortalKey
  owner: number
  children: ReactNode
}

let entries: Entry[] = []
let nextKey = 0
let nextRendererId = 0
let activeRendererId: number | null = null
const renderers: number[] = []
const listeners = new Set<() => void>()
let snapshot = { revision: 0, entries }
const notify = () => {
  snapshot = { revision: snapshot.revision + 1, entries }
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => snapshot

export function mountPortal(children: ReactNode): PortalKey {
  if (activeRendererId === null) {
    throw new Error(
      'Mount TsukiProvider inside react-native-teleport PortalProvider before showing overlays',
    )
  }
  const key = nextKey++
  entries = [...entries, { key, owner: activeRendererId!, children }]
  notify()
  return key
}

export function updatePortal(key: PortalKey, children: ReactNode) {
  entries = entries.map((entry) => (entry.key === key ? { ...entry, children } : entry))
  notify()
}

export function unmountPortal(key: PortalKey) {
  entries = entries.filter((entry) => entry.key !== key)
  notify()
}

export function ImperativePortalRenderer() {
  const id = useRef<number | null>(null)
  if (id.current === null) id.current = nextRendererId++
  useEffect(() => registerPortalRenderer(id.current!), [])
  const currentSnapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return currentSnapshot.entries
    .filter(({ owner }) => owner === id.current)
    .map(({ key, children }) => (
      <TeleportPortal key={key} name={`tsuki-${key}`}>
        <View collapsable={false} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {children}
        </View>
      </TeleportPortal>
    ))
}

export function registerPortalRenderer(id: number) {
  renderers.push(id)
  activeRendererId = id
  notify()
  return () => {
    const index = renderers.indexOf(id)
    if (index >= 0) renderers.splice(index, 1)
    entries = entries.filter((entry) => entry.owner !== id)
    activeRendererId = renderers[renderers.length - 1] ?? null
    notify()
  }
}
