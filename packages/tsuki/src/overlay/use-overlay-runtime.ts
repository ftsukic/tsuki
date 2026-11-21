import { useCallback, useContext, useSyncExternalStore } from 'react'
import { ThemeContext } from '../theme/context'
import { OverlayRuntimeContext } from './context'
import type { OverlayBackBehavior, OverlayMountOptions, OverlayUpdate } from './types'

export function useOverlayRuntime(scope: 'current' | 'root' = 'current') {
  const runtime = useContext(OverlayRuntimeContext)
  const currentTheme = useContext(ThemeContext)
  if (!runtime) {
    throw new Error('useOverlayRuntime must be used inside a root TsukiProvider.')
  }

  const { registry } = runtime
  const theme = scope === 'root' ? runtime.rootTheme : currentTheme
  const themeScope = scope === 'root' ? runtime.rootThemeScope : runtime.themeScope
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
      onBack?: () => void
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
  const setHostEnabled = runtime.setHostEnabled

  return {
    registry,
    theme,
    entries,
    backResult,
    mount,
    update,
    unmount,
    dispatchBack,
    hostEnabled: runtime.hostEnabled,
    setHostEnabled,
  }
}
