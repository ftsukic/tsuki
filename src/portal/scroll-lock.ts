import { createContext } from 'react'

/** A lock belongs to the nearest PortalHost, not to every screen in the app. */
export function createScrollLockStore() {
  const holders = new Set<symbol>()
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => holders.size > 0,
    acquire() {
      const holder = Symbol('background-scroll-lock')
      holders.add(holder)
      notify()
      return () => {
        if (holders.delete(holder)) notify()
      }
    },
  }
}

export const BackgroundScrollLockContext = createContext<ReturnType<
  typeof createScrollLockStore
> | null>(null)
