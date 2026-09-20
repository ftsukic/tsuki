import type { ReactNode } from 'react'

export type PortalKey = number

export interface PortalProps {
  children: ReactNode
}

export interface PortalHostProps {
  children?: ReactNode
}

export interface PortalMethods {
  mount: (children: ReactNode) => PortalKey
  update: (key: number, children: ReactNode) => void
  unmount: (key: number) => void
}
