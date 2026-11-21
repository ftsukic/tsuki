import { createContext } from 'react'
import type { ResolvedTheme } from '../theme/types'
import type { OverlayRegistry } from './types'

export interface OverlayRuntimeContextValue {
  registry: OverlayRegistry
  theme: ResolvedTheme
  themeScope: object
  rootTheme: ResolvedTheme
  rootThemeScope: object
  hostEnabled: boolean
  setHostEnabled: (enabled: boolean) => void
}

export const OverlayRuntimeContext = createContext<OverlayRuntimeContextValue | null>(null)
