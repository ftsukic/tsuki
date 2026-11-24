import {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { StyleSheet, View } from 'react-native'
import type { ViewProps } from 'react-native'
import { OverlayRegistryContext } from '../overlay/context'
import { PortalHostGeometryContext } from './context'
import { PortalEntryLayer } from './portal-layer'

export interface PortalHostProps extends Omit<ViewProps, 'children' | 'pointerEvents'> {
  name: string
}

/** Registers a local View target for Portal entries in the current Tsuki root. */
export function PortalHost({ name, style, testID, onLayout, ...viewProps }: PortalHostProps) {
  const registry = useContext(OverlayRegistryContext)
  const hostRef = useRef<View>(null)
  const host = useRef<object>({}).current
  const [layoutVersion, setLayoutVersion] = useState(0)

  if (!registry) throw new Error('PortalHost must be used inside a root TsukiProvider.')
  if (!name.trim() || name === 'root') {
    throw new Error('PortalHost names must be non-empty and cannot use the reserved name "root".')
  }

  const entries = useSyncExternalStore(
    registry.subscribePortals,
    registry.getPortalSnapshot,
    registry.getPortalSnapshot,
  )
  const namedEntries = entries.filter((entry) => entry.host === name)
  const hostGeometry = useMemo(() => ({ ref: hostRef, layoutVersion }), [hostRef, layoutVersion])
  const handleLayout = useCallback(
    (event: Parameters<NonNullable<ViewProps['onLayout']>>[0]) => {
      setLayoutVersion((version) => version + 1)
      onLayout?.(event)
    },
    [onLayout],
  )

  useLayoutEffect(() => {
    const registration = registry.registerPortalHost(name, host)
    return () => {
      registry.unregisterPortalHost(registration)
    }
  }, [host, name, registry])

  return (
    <PortalHostGeometryContext.Provider value={hostGeometry}>
      <View
        {...viewProps}
        collapsable={false}
        onLayout={handleLayout}
        pointerEvents="box-none"
        ref={hostRef}
        style={[styles.host, style]}
        testID={testID ?? `tsuki-portal-host-${name}`}
      >
        {namedEntries.map((entry, index) => (
          <PortalEntryLayer entry={entry} key={`portal-${entry.id}`} zIndex={index + 1} />
        ))}
      </View>
    </PortalHostGeometryContext.Provider>
  )
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
  },
})
