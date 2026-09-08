import { createContext } from 'react'

export interface ActiveSwipeCell {
  id: string
  close: () => void
}

export interface InteractionContextValue {
  requestOpen: (id: string, close: () => void) => void
  clear: (id: string) => void
  notifyPress: (id?: string) => void
  closeCurrent: () => void
  closeCurrentSwipeCell: () => void
}

const noop = () => undefined

export const InteractionContext = createContext<InteractionContextValue>({
  requestOpen: noop,
  clear: noop,
  notifyPress: noop,
  closeCurrent: noop,
  closeCurrentSwipeCell: noop,
})
