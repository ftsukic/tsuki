import { createContext } from 'react'
import type { RefObject } from 'react'
import type { View } from 'react-native'

export interface PortalHostGeometry {
  ref: RefObject<View | null>
  layoutVersion: number
}

export const PortalHostGeometryContext = createContext<PortalHostGeometry | null>(null)
