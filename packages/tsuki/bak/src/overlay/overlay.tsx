import { forwardRef } from 'react'
import type { View } from 'react-native'
import { TeleportPortal as Portal } from '../portal/teleport-portal'
import type { OverlayProps } from './types'
import { OverlayAnimatedSurface } from './overlay-animated-surface'

export const Overlay = forwardRef<View, OverlayProps>(function Overlay(props, ref) {
  return (
    <Portal hostName="root">
      <OverlayAnimatedSurface {...props} ref={ref} />
    </Portal>
  )
})

Overlay.displayName = 'Overlay'
