import { StyleSheet, View } from 'react-native'
import { OverlayThemeBridge } from '../overlay/theme-bridge'
import type { PortalEntry } from '../overlay/types'

export function PortalEntryLayer({
  accessibilityHidden = false,
  entry,
  zIndex,
}: {
  accessibilityHidden?: boolean
  entry: PortalEntry
  zIndex: number
}) {
  return (
    <View
      accessibilityElementsHidden={accessibilityHidden}
      importantForAccessibility={accessibilityHidden ? 'no-hide-descendants' : 'auto'}
      pointerEvents="box-none"
      style={[styles.layer, { zIndex, elevation: zIndex }]}
      testID={`tsuki-portal-layer-${entry.id}`}
    >
      <OverlayThemeBridge theme={entry.theme}>{entry.content}</OverlayThemeBridge>
    </View>
  )
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill },
})
