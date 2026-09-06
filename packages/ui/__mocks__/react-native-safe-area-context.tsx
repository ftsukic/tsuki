import { createContext } from 'react'
import type { PropsWithChildren } from 'react'

export const SafeAreaInsetsContext = createContext({ bottom: 0, left: 0, right: 0, top: 0 })

export function SafeAreaProvider({ children }: PropsWithChildren) {
  return children
}

export function SafeAreaView({ children }: PropsWithChildren) {
  return children
}

export function useSafeAreaInsets() {
  return { bottom: 0, left: 0, right: 0, top: 0 }
}
