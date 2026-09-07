import type { ReactNode } from 'react'
import { Provider } from '@ftsukic/tsuki'

export function rootContainer(container: ReactNode) {
  return <Provider>{container}</Provider>
}
