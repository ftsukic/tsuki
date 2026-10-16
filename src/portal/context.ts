import { createContext } from 'react'
import type { PortalBackend, PortalMethods } from './types'

export const PortalContext = createContext<PortalMethods | null>(null)

export const PortalBackendContext = createContext<PortalBackend | undefined>(undefined)
export const PortalDestinationContext = createContext<{
  backend: PortalBackend | undefined
  hostName: string
} | null>(null)
