import { forwardRef } from 'react'
import type { View } from 'react-native'
import { Portal } from '../portal'
import type { OverlayProps } from './interface'
import { OverlayAnimatedSurface } from './animated-surface'

export const Overlay = forwardRef<View, OverlayProps>(function Overlay(props, ref) {
  return (
    <Portal>
      <OverlayAnimatedSurface {...props} ref={ref} />
    </Portal>
  )
})

Overlay.displayName = 'Overlay'
