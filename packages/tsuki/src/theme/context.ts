import { createContext } from 'react'
import { getDefaultTheme } from './defaults'
import type { ResolvedTheme, ThemeScopeRenderer } from './types'

export const ThemeContext = createContext<ResolvedTheme>(getDefaultTheme('light'))
export const ThemeScopeRendererContext = createContext<ThemeScopeRenderer | undefined>(undefined)
