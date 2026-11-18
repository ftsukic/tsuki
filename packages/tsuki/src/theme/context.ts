import { createContext } from 'react'
import { getDefaultTheme } from './defaults'
import type { ResolvedTheme } from './types'

export const ThemeContext = createContext<ResolvedTheme>(getDefaultTheme('light'))
