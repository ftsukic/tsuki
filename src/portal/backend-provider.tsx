import { Fragment, useContext, useState } from 'react'
import { PortalBackendContext } from './context'
import { defaultPortalBackend } from './default-backend'
import type { PortalBackend } from './types'
import type { PropsWithChildren } from 'react'

/** Owns backend initialization; page hosts inherit the selected backend. */
export function PortalBackendProvider({
  backend,
  children,
}: PropsWithChildren<{ backend?: PortalBackend }>) {
  const inheritedBackend = useContext(PortalBackendContext)
  const [selectedBackend] = useState<PortalBackend | null>(() => {
    if (backend !== undefined) return backend
    if (inheritedBackend !== undefined) return inheritedBackend
    return defaultPortalBackend
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
