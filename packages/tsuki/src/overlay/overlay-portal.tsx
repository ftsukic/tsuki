import { useContext, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from '../theme/context'
import { OverlayRegistryContext, OverlayThemeScopeContext } from './context'
import type { OverlayTransitionConfig } from './transition/types'
import type { OverlayAccessibilityConfig, OverlayBackBehavior, OverlayRegistry } from './types'
import { useStrictUnmountCleanup } from './use-strict-mount-cleanup'

export interface OverlayPortalProps {
  visible: boolean
  backBehavior: OverlayBackBehavior
  onBack?: () => void
  onEntered?: () => void
  onExited?: () => void
  busy?: boolean
  transition?: OverlayTransitionConfig
  accessibility?: OverlayAccessibilityConfig
  mask?: ReactNode
  children?: ReactNode
}

interface OverlayPortalEntry {
  registry: OverlayRegistry
  id: number
}

/** Internal declarative bridge into the Overlay Registry owned by the current React Root. */
export function OverlayPortal({
  visible,
  backBehavior,
  onBack,
  onEntered,
  onExited,
  busy = false,
  transition,
  accessibility,
  mask,
  children,
}: OverlayPortalProps) {
  const registry = useContext(OverlayRegistryContext)
  const themeContext = useContext(OverlayThemeScopeContext)
  const theme = useContext(ThemeContext)
  const entryRef = useRef<OverlayPortalEntry | null>(null)

  if (!registry || !themeContext) {
    throw new Error('OverlayPortal must be used inside a root TsukiProvider.')
  }

  const { themeScope } = themeContext

  useLayoutEffect(() => {
    const previousEntry = entryRef.current
    if (previousEntry && previousEntry.registry !== registry) {
      previousEntry.registry.unmount(previousEntry.id)
      entryRef.current = null
    }

    const entry = entryRef.current
    if (visible) {
      const patch = {
        content: children,
        mask,
        transition,
        accessibility,
        visible,
        busy,
        backBehavior,
        onBack,
        onEntered,
        onExited,
      }
      if (entry && !registry.update(entry.id, patch)) entryRef.current = null

      if (!entryRef.current) {
        const id = registry.mount({
          ...patch,
          theme,
          themeScope,
        })
        entryRef.current = { registry, id }
      }
    } else if (
      entry &&
      !registry.update(entry.id, {
        content: children,
        mask,
        transition,
        accessibility,
        busy,
        backBehavior,
        onBack,
        onEntered,
        onExited,
        visible: false,
      })
    ) {
      // completeExit removes entries from the Registry while this Portal may stay mounted.
      entryRef.current = null
    }
  }, [
    accessibility,
    backBehavior,
    busy,
    children,
    mask,
    onBack,
    onEntered,
    onExited,
    registry,
    theme,
    themeScope,
    transition,
    visible,
  ])

  useStrictUnmountCleanup(
    () => {
      const owned = entryRef.current
      if (!owned) return
      owned.registry.unmount(owned.id)
      entryRef.current = null
    },
    [registry],
    'layout',
  )

  return null
}
