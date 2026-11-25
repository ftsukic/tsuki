import { useContext, useLayoutEffect, useRef } from 'react'
import { OverlayRegistryContext } from '../overlay/context'
import { useOverlayController } from '../overlay/useOverlayController'
import { useTsukiTheme } from '../theme/theme'
import { bindDialogService, releaseDialogService } from './imperative'
import type { DialogServiceBridgeProps } from './types'

/** Binds a DialogService to the nearest TsukiProvider Root and Theme scope. */
export function DialogServiceBridge({ service }: DialogServiceBridgeProps) {
  const controller = useOverlayController()
  const registry = useContext(OverlayRegistryContext)
  const theme = useTsukiTheme()
  const durationRef = useRef(theme.components.Dialog.animationDuration)
  durationRef.current = theme.components.Dialog.animationDuration

  if (!registry) {
    throw new Error('DialogServiceBridge must be used inside a root TsukiProvider.')
  }

  useLayoutEffect(() => {
    const binding = bindDialogService(service, controller, registry, () => durationRef.current)
    return () => releaseDialogService(service, binding)
  }, [controller, registry, service])

  return null
}
