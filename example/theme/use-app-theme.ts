import { useContext } from 'react'
import { AppThemeContext } from './context'

function useAppThemeContext() {
  const context = useContext(AppThemeContext)
  if (!context) throw new Error('AppTheme hooks require AppThemeProvider')
  return context
}

export function useAppTheme() {
  return useAppThemeContext().theme
}

export function useAppThemeSettings() {
  const { mode, setMode, baseFontSize, setBaseFontSize } = useAppThemeContext()
  return { mode, setMode, baseFontSize, setBaseFontSize }
}

export function useAppThemeDefinition() {
  return useAppThemeContext().definition
}
