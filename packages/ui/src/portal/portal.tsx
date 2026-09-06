import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { StyleSheet, View } from 'react-native'

interface PortalEntry {
  key: number
  children: ReactNode
}
interface PortalManager {
  mount: (children: ReactNode) => number
  update: (key: number, children: ReactNode) => void
  unmount: (key: number) => void
}
export type PortalKey = number
let activeManager: PortalManager | null = null
const PortalContext = createContext<PortalManager | null>(null)
const styles = StyleSheet.create({ host: { flex: 1 } })

export function PortalHost({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<PortalEntry[]>([])
  const nextKey = useRef(0)
  const manager = useMemo<PortalManager>(
    () => ({
      mount: (content) => {
        const key = nextKey.current++
        setEntries((value) => [...value, { key, children: content }])
        return key
      },
      update: (key, content) =>
        setEntries((value) =>
          value.map((entry) => (entry.key === key ? { ...entry, children: content } : entry)),
        ),
      unmount: (key) => setEntries((value) => value.filter((entry) => entry.key !== key)),
    }),
    [],
  )
  useEffect(() => {
    activeManager = manager
    return () => {
      if (activeManager === manager) activeManager = null
    }
  }, [manager])
  return (
    <PortalContext.Provider value={manager}>
      <View style={styles.host} collapsable={false}>
        {children}
      </View>
      {entries.map((entry) => (
        <View
          key={entry.key}
          pointerEvents="box-none"
          style={StyleSheet.absoluteFill}
          collapsable={false}
        >
          {entry.children}
        </View>
      ))}
    </PortalContext.Provider>
  )
}

export function mountPortal(children: ReactNode): PortalKey {
  if (!activeManager)
    throw new Error('PortalHost must be rendered before mounting an imperative portal')
  return activeManager.mount(children)
}

export function updatePortal(key: PortalKey, children: ReactNode) {
  activeManager?.update(key, children)
}

export function unmountPortal(key: PortalKey) {
  activeManager?.unmount(key)
}

export function Portal({ children }: { children?: ReactNode }) {
  const manager = useContext(PortalContext)
  const key = useRef(-1)
  useEffect(() => {
    if (!manager) return
    key.current = manager.mount(children)
    return () => manager.unmount(key.current)
  }, [manager])
  useEffect(() => {
    if (manager && key.current >= 0) manager.update(key.current, children)
  }, [children, manager])
  if (!manager) throw new Error('Portal must be rendered inside PortalHost')
  return null
}
