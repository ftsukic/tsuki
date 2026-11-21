import { useEffect, useRef, useSyncExternalStore } from 'react'
import { StyleSheet, View } from 'react-native'
import { subscribeToOverlayBack } from './back-adapter'
import { OverlayThemeBridge } from './theme-bridge'
import { OverlayEntryTransition } from './transition'
import type { OverlayRegistry } from './types'

export function OverlayHost({ registry }: { registry: OverlayRegistry }) {
  const entries = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  )
  const host = useRef<object>({}).current

  useEffect(() => {
    const registration = registry.registerHost(host)
    let unsubscribeBack: () => void
    try {
      unsubscribeBack = subscribeToOverlayBack(() => registry.dispatchBack())
    } catch (error) {
      registry.unregisterHost(registration)
      throw error
    }

    return () => {
      unsubscribeBack()
      registry.unregisterHost(registration)
    }
  }, [host, registry])

  return (
    <View pointerEvents="box-none" style={styles.host} testID="tsuki-overlay-host">
      {entries.map((entry, index) => (
        <View
          key={entry.id}
          pointerEvents="box-none"
          style={[styles.layer, { zIndex: index + 1, elevation: index + 1 }]}
          testID={`tsuki-overlay-layer-${entry.id}`}
        >
          <OverlayThemeBridge theme={entry.theme}>
            <OverlayEntryTransition entry={entry} registry={registry} />
          </OverlayThemeBridge>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  layer: {
    ...StyleSheet.absoluteFill,
  },
})
