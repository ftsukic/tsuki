/**
 * @title Named Host
 * @description Mounts a Portal inside a local View target that occupies only its parent's bounds.
 */
import { StyleSheet, View } from 'react-native'
import { Portal, PortalHost, Surface, Text } from '@ftsukic/tsuki'

export default function NamedPortalHost() {
  return (
    <View style={{ minHeight: 132, overflow: 'hidden' }}>
      <PortalHost name="preview-panel" style={StyleSheet.absoluteFill} />
      <Portal host="preview-panel">
        <Surface className="m-3" bordered>
          <Text>Mounted in the local Preview Host.</Text>
        </Surface>
      </Portal>
    </View>
  )
}
