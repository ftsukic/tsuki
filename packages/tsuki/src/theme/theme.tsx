import { useContext } from 'react'
import { ThemeContext } from './context'

export function useTsukiTheme() {
  return useContext(ThemeContext)
}
