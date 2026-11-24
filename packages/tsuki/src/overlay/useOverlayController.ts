import { useContext, useLayoutEffect, useMemo, useRef } from 'react'
import { ThemeContext } from '../theme/context'
import { OverlayRegistryContext, OverlayThemeScopeContext } from './context'
import {
  bindOverlayControllerOwner,
  createOverlayController,
  createOverlayControllerOwner,
  releaseOverlayControllerOwner,
} from './controller'
import type {
  OverlayController,
  OverlayControllerOwner,
  OverlayControllerScope,
} from './controller'
import { useStrictUnmountCleanup } from './use-strict-mount-cleanup'

/** Returns an imperative controller bound to the current Root Registry and Theme scope. */
export function useOverlayController(scope: OverlayControllerScope = 'current'): OverlayController {
  const registry = useContext(OverlayRegistryContext)
  const themeContext = useContext(OverlayThemeScopeContext)
  const currentTheme = useContext(ThemeContext)
  const ownerRef = useRef<OverlayControllerOwner | null>(null)

  const rootScope = scope === 'root'
  const boundTheme = themeContext ? (rootScope ? themeContext.rootTheme : currentTheme) : null
  const boundThemeScope = themeContext
    ? rootScope
      ? themeContext.rootThemeScope
      : themeContext.themeScope
    : null

  if (registry && !ownerRef.current) {
    ownerRef.current = createOverlayControllerOwner(registry)
    if (boundTheme && boundThemeScope) {
      bindOverlayControllerOwner(ownerRef.current, boundTheme, boundThemeScope)
    }
  }

  const owner = ownerRef.current
  if (registry && owner && registry !== owner.registry) {
    throw new Error('A useOverlayController owner cannot move between React Roots.')
  }

  const controller = useMemo(() => (owner ? createOverlayController(owner) : null), [owner])

  useLayoutEffect(() => {
    if (!owner || !boundTheme || !boundThemeScope) return
    owner.active = true
    bindOverlayControllerOwner(owner, boundTheme, boundThemeScope)
  }, [boundTheme, boundThemeScope, owner])

  useStrictUnmountCleanup(
    () => {
      if (owner) releaseOverlayControllerOwner(owner)
    },
    [owner],
    'effect',
  )

  if (!registry || !themeContext || !owner || !controller) {
    throw new Error('useOverlayController must be used inside a root TsukiProvider.')
  }

  return controller
}
