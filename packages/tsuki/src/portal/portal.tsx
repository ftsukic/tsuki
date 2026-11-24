import { useContext, useLayoutEffect, useRef } from 'react'
import { OverlayRegistryContext, OverlayThemeScopeContext } from '../overlay/context'
import { useStrictUnmountCleanup } from '../overlay/use-strict-mount-cleanup'
import { ThemeContext } from '../theme/context'
import type { OverlayRegistry } from '../overlay/types'
import type { PortalProps } from './types'

interface PortalOwner {
  registry: OverlayRegistry
  id: number
}

/** Renders children in the default Host owned by the current Tsuki root. */
export function Portal({ children, host = 'root' }: PortalProps) {
  const registry = useContext(OverlayRegistryContext)
  const themeContext = useContext(OverlayThemeScopeContext)
  const theme = useContext(ThemeContext)
  const ownerRef = useRef<PortalOwner | null>(null)

  if (!registry || !themeContext) {
    throw new Error('Portal must be used inside a root TsukiProvider.')
  }
  if (!host.trim()) throw new Error('Portal host must be a non-empty string.')

  const { themeScope } = themeContext

  useLayoutEffect(() => {
    let owner = ownerRef.current
    if (owner && owner.registry !== registry) {
      owner.registry.unmountPortal(owner.id)
      ownerRef.current = null
      owner = null
    }

    if (owner && !registry.updatePortal(owner.id, { content: children, host, theme, themeScope })) {
      ownerRef.current = null
      owner = null
    }

    if (!owner) {
      const id = registry.mountPortal({ content: children, host, theme, themeScope })
      ownerRef.current = { registry, id }
    }
  }, [children, host, registry, theme, themeScope])

  useStrictUnmountCleanup(
    () => {
      const owned = ownerRef.current
      if (!owned) return
      owned.registry.unmountPortal(owned.id)
      ownerRef.current = null
    },
    [registry],
    'layout',
  )

  return null
}
