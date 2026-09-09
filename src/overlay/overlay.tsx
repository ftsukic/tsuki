import { forwardRef } from 'react'
import type { View } from 'react-native'
import type { OverlayProps } from './interface'
import { OverlayAnimatedSurface } from './animated-surface'

export const Overlay = forwardRef<View, OverlayProps>(function Overlay(props, ref) {
  return <OverlayAnimatedSurface {...props} ref={ref} />
})

Overlay.displayName = 'Overlay'
