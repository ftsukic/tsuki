import { createContext } from 'react'
import type { RefObject } from 'react'
import type { View } from 'react-native'
import type { ResolvedTheme } from '../theme/types'
import type { OverlayRegistry } from './types'

export interface OverlayThemeScopeContextValue {
  theme: ResolvedTheme
  themeScope: object
  rootTheme: ResolvedTheme
  rootThemeScope: object
}

export interface OverlayHostGeometryContextValue {
  hostEnabled: boolean
  setHostEnabled: (enabled: boolean) => void
  rootHostRef: RefObject<View | null>
  rootHostLayoutVersion: number
  onRootHostLayout: () => void
}

export const OverlayRegistryContext = createContext<OverlayRegistry | null>(null)
export const OverlayThemeScopeContext = createContext<OverlayThemeScopeContextValue | null>(null)
export const OverlayHostGeometryContext = createContext<OverlayHostGeometryContextValue | null>(
  null,
)
