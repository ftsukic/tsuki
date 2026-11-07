import { createContext } from 'react'
import type { PortalBackend, PortalMethods } from './types'

export const PortalContext = createContext<PortalMethods | null>(null)

/** undefined means no Provider has selected a backend; null explicitly selects JS. */
export const PortalBackendContext = createContext<PortalBackend | null | undefined>(undefined)
export const PortalDestinationContext = createContext<{
  backend: PortalBackend | null | undefined
  hostName: string
} | null>(null)
