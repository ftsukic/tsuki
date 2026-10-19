import type { ReactNode } from 'react'
import { PortalProvider } from 'react-native-teleport'
import { TsukiProvider } from '..'

export function PortalHost({ children }: { children?: ReactNode }) {
  return (
    <PortalProvider>
      <TsukiProvider>{children}</TsukiProvider>
    </PortalProvider>
  )
}
