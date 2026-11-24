import { useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { StyleSheet, View } from 'react-native'
import { subscribeToOverlayBack } from './back-adapter'
import { useOverlayAccessibilityFocus } from './accessibility/use-overlay-accessibility-focus'
import { OverlayThemeBridge } from './theme-bridge'
import { OverlayEntryTransition } from './transition'
import type { OverlayRegistry } from './types'
import type { PortalEntry } from './types'
import { PortalEntryLayer } from '../portal/portal-layer'
import { OverlayHostGeometryContext } from './context'
import { PortalHostGeometryContext } from '../portal/context'

export function OverlayHost({ registry }: { registry: OverlayRegistry }) {
  const geometry = useContext(OverlayHostGeometryContext)
  if (!geometry) throw new Error('OverlayHost must be rendered by its root TsukiProvider.')
  const hostGeometry = useMemo(
    () => ({ ref: geometry.rootHostRef, layoutVersion: geometry.rootHostLayoutVersion }),
    [geometry.rootHostLayoutVersion, geometry.rootHostRef],
  )
  const entries = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  )
  const portalEntries = useSyncExternalStore(
    registry.subscribePortals,
    registry.getPortalSnapshot,
    registry.getPortalSnapshot,
  ).filter((entry) => entry.host === 'root')
  const overlayIndexById = new Map(entries.map((entry, index) => [entry.id, index]))
  const orderedEntries = [
    ...entries.map((entry) => ({ kind: 'overlay' as const, entry })),
    ...portalEntries.map((entry: PortalEntry) => ({ kind: 'portal' as const, entry })),
  ].sort((left, right) => left.entry.order - right.entry.order)
  const accessibility = useOverlayAccessibilityFocus(registry, entries)
  const modalBoundary = entries[accessibility.boundaryIndex]
  const modalBoundaryOrder = modalBoundary?.order
  const hasHigherNonModal =
    modalBoundary !== undefined &&
    (entries
      .slice(accessibility.boundaryIndex + 1)
      .some((entry) => entry.phase !== 'hidden' && entry.accessibility.mode === 'non-modal') ||
      portalEntries.some((entry) => entry.order > modalBoundary.order))
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
    <PortalHostGeometryContext.Provider value={hostGeometry}>
      <View
        onLayout={geometry.onRootHostLayout}
        pointerEvents="box-none"
        ref={geometry.rootHostRef}
        style={styles.host}
        testID="tsuki-overlay-host"
      >
        {orderedEntries.map((renderEntry, stackIndex) => {
          if (renderEntry.kind === 'portal') {
            const isolated =
              modalBoundaryOrder !== undefined && renderEntry.entry.order < modalBoundaryOrder
            return (
              <PortalEntryLayer
                accessibilityHidden={isolated}
                entry={renderEntry.entry}
                key={`portal-${renderEntry.entry.id}`}
                zIndex={stackIndex + 1}
              />
            )
          }

          const entry = renderEntry.entry
          const index = overlayIndexById.get(entry.id) ?? 0
          const modalBoundary = index === accessibility.boundaryIndex
          const isolated =
            entry.phase === 'hidden' ||
            (accessibility.boundaryIndex !== -1 && index < accessibility.boundaryIndex)

          return (
            <View
              key={entry.id}
              accessibilityElementsHidden={isolated}
              accessibilityViewIsModal={modalBoundary && !hasHigherNonModal}
              accessible={false}
              importantForAccessibility={isolated ? 'no-hide-descendants' : 'auto'}
              onLayout={accessibility.getLayoutHandler(entry.id)}
              pointerEvents="box-none"
              ref={accessibility.getContainerRef(entry.id)}
              style={[styles.layer, { zIndex: stackIndex + 1, elevation: stackIndex + 1 }]}
              testID={`tsuki-overlay-layer-${entry.id}`}
            >
              <OverlayThemeBridge theme={entry.theme}>
                <OverlayEntryTransition entry={entry} registry={registry} />
              </OverlayThemeBridge>
            </View>
          )
        })}
      </View>
    </PortalHostGeometryContext.Provider>
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
