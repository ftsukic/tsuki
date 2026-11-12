import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { TabProps } from './types'

/** Declarative tab descriptor. Tabs renders its title and optional active content. */
export function Tab({ children }: TabProps): ReactNode {
  return <Fragment>{children}</Fragment>
}

Tab.displayName = 'Tabs.Tab'
