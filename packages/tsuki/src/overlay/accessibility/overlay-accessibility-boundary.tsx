import { useSyncExternalStore } from 'react'
import type { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'
import { getOverlayAccessibilityBoundaryIndex } from './isolation'
import type { OverlayRegistry } from '../types'

/** Isolates only the page subtree; the Root OverlayHost remains its sibling. */
export function OverlayAccessibilityBoundary({
  children,
  registry,
}: PropsWithChildren<{ registry: OverlayRegistry }>) {
  const isModalActive = useSyncExternalStore(
    registry.subscribe,
    () => getOverlayAccessibilityBoundaryIndex(registry.getSnapshot()) !== -1,
    () => getOverlayAccessibilityBoundaryIndex(registry.getSnapshot()) !== -1,
  )

  return (
    <View
      accessibilityElementsHidden={isModalActive}
      collapsable={false}
      importantForAccessibility={isModalActive ? 'no-hide-descendants' : 'auto'}
      pointerEvents="box-none"
      style={styles.page}
      testID="tsuki-overlay-page-accessibility-boundary"
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1 },
})
