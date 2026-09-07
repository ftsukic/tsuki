import { createContext } from 'react'
import type { PortalMethods } from './interface'

export const PortalContext = createContext<PortalMethods | null>(null)
