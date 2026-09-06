import { Portal } from '../portal'
import type { OverlayProps } from './interface'
import { OverlaySurface } from './overlay'

export function Overlay(props: OverlayProps) {
  return (
    <Portal>
      <OverlaySurface {...props} />
    </Portal>
  )
}

export { OverlaySurface }
export type { OverlayProps }
