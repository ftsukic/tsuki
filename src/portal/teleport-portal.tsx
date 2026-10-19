import { Portal } from 'react-native-teleport'
import type { PropsWithChildren } from 'react'
import { SwipeCellPressContext } from '../swipe-cell/context'

interface TeleportPortalProps {
  hostName?: string
  name?: string
}

export function TeleportPortal({
  hostName = 'root',
  name,
  children,
}: PropsWithChildren<TeleportPortalProps>) {
  return (
    <Portal hostName={hostName} name={name}>
      <SwipeCellPressContext.Provider value={null}>{children}</SwipeCellPressContext.Provider>
    </Portal>
  )
}
