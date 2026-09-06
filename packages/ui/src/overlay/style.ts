import type { OverlayToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createOverlayStyles(_token: OverlayToken) {
  void _token
  return StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject },
    touchable: { flex: 1 },
  })
}
