import { useContext, useLayoutEffect } from 'react'
import { OverlayRegistryContext } from '../overlay/context'
import { useOverlayController } from '../overlay/useOverlayController'
import { bindDialogService, releaseDialogService } from './imperative'
import type { DialogServiceBridgeProps } from './types'

/** Binds a DialogService to the nearest TsukiProvider Root and Theme scope. */
export function DialogServiceBridge({ service }: DialogServiceBridgeProps) {
  const controller = useOverlayController()
  const registry = useContext(OverlayRegistryContext)

  if (!registry) {
    throw new Error('DialogServiceBridge must be used inside a root TsukiProvider.')
  }

  useLayoutEffect(() => {
    const binding = bindDialogService(service, controller, registry)
    return () => releaseDialogService(service, binding)
  }, [controller, registry, service])

  return null
}
