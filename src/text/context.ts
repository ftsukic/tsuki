import { createContext } from 'react'
import type { TextStyle } from 'react-native'

export interface TextInheritanceContextValue {
  className?: string
  style?: TextStyle
}

export const TextInheritanceContext = createContext<TextInheritanceContextValue | null>(null)
