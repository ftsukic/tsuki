import { useCallback, useContext, useSyncExternalStore } from 'react'
import { ThemeContext } from '../theme/context'
import {
  OverlayHostGeometryContext,
  OverlayRegistryContext,
  OverlayThemeScopeContext,
} from './context'
import type { OverlayBackBehavior, OverlayMountOptions, OverlayUpdate } from './types'

export function useOverlayRuntime(scope: 'current' | 'root' = 'current') {
  const registry = useContext(OverlayRegistryContext)
  const themeContext = useContext(OverlayThemeScopeContext)
  const geometry = useContext(OverlayHostGeometryContext)
  const currentTheme = useContext(ThemeContext)
  if (!registry || !themeContext || !geometry) {
    throw new Error('useOverlayRuntime must be used inside a root TsukiProvider.')
  }

  const theme = scope === 'root' ? themeContext.rootTheme : currentTheme
  const themeScope = scope === 'root' ? themeContext.rootThemeScope : themeContext.themeScope
  const entries = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  )
  const backResult = useSyncExternalStore(
    registry.subscribeBackResult,
    registry.getBackResultSnapshot,
    registry.getBackResultSnapshot,
  )
  const mount = useCallback(
    (options: {
      content: OverlayMountOptions['content']
      backBehavior: OverlayBackBehavior
      accessibility?: OverlayMountOptions['accessibility']
      onBack?: () => void
      onEntered?: () => void
      onExited?: () => void
      busy?: boolean
      visible?: boolean
      mask?: OverlayMountOptions['mask']
      transition?: OverlayMountOptions['transition']
      onTransitionProgress?: OverlayMountOptions['onTransitionProgress']
    }) => registry.mount({ ...options, theme, themeScope }),
    [registry, theme, themeScope],
  )
  const update = useCallback(
    (id: number, patch: OverlayUpdate) => registry.update(id, patch),
    [registry],
  )
  const unmount = useCallback((id: number) => registry.unmount(id), [registry])
  const dispatchBack = useCallback(() => registry.dispatchBack(), [registry])
  const setHostEnabled = geometry.setHostEnabled

  return {
    registry,
    theme,
    entries,
    backResult,
    mount,
    update,
    unmount,
    dispatchBack,
    hostEnabled: geometry.hostEnabled,
    setHostEnabled,
  }
}
