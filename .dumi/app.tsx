import type { ReactNode } from 'react'
import { Provider } from '@ftsukic/tsuki'

function isDemoRuntime() {
  if (typeof window === 'undefined') return false

  return window.location.pathname.includes('/~demos/') || window.location.hash.includes('#/~demos/')
}

export function rootContainer(container: ReactNode) {
  return isDemoRuntime() ? <Provider>{container}</Provider> : container
}
