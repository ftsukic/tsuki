import { Fragment, useContext, useState } from 'react'
import { PortalBackendContext } from './context'
import type { PortalBackend } from './types'
import type { PropsWithChildren } from 'react'

/** Owns backend initialization; page hosts inherit the selected backend. */
export function PortalBackendProvider({
  backend,
  teleport,
  children,
}: PropsWithChildren<{ backend?: PortalBackend; teleport?: boolean }>) {
  const inheritedBackend = useContext(PortalBackendContext)
  const [selectedBackend] = useState(() => {
    if (backend) return backend
    if (teleport === undefined) return inheritedBackend
    if (!teleport) return undefined
    if (inheritedBackend) return inheritedBackend
    throw new Error(
      'Import teleportPortalBackend from @ftsukic/tsuki/teleport and pass portalBackend to enable Teleport.',
    )
  })
  const BackendProvider =
    selectedBackend && selectedBackend !== inheritedBackend ? selectedBackend.Provider : Fragment

  return (
    <BackendProvider>
      <PortalBackendContext.Provider value={selectedBackend}>
        {children}
      </PortalBackendContext.Provider>
    </BackendProvider>
  )
}
