import type { StyleProp, ViewStyle } from 'react-native'
import type { ComponentType, ReactNode } from 'react'

export type PortalKey = number

export interface PortalProps {
  children: ReactNode
}

export interface PortalHostProps {
  /** @deprecated Pass portalBackend; true requires an explicit or inherited backend. */
  teleport?: boolean
  /** Custom backend, taking precedence over teleport; fixed at mount. */
  portalBackend?: PortalBackend
  children?: ReactNode
}

export interface PortalMethods {
  mount: (children: ReactNode) => PortalKey
  update: (key: number, children: ReactNode) => void
  unmount: (key: number) => void
}

/** Optional renderer preserving the source React tree for declarative portals. */
export interface PortalBackend {
  Provider: ComponentType<{ children?: ReactNode }>
  Host: ComponentType<{
    name: string
    style?: StyleProp<ViewStyle>
  }>
  Portal: ComponentType<{ hostName?: string; style?: StyleProp<ViewStyle>; children?: ReactNode }>
}
