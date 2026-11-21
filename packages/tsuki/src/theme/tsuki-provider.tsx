import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { OverlayHost } from '../overlay/overlay-host'
import { OverlayRuntimeContext } from '../overlay/context'
import { createOverlayRegistry } from '../overlay/registry'
import { ThemeContext } from './context'
import { getDefaultTheme } from './defaults'
import { mergeTheme } from './merge-theme'
import type { ResolvedTheme, ThemeConfig, ThemeScheme } from './types'

export interface TsukiProviderProps extends PropsWithChildren {
  scheme: ThemeScheme
  theme?: ThemeConfig
}

export function TsukiProvider({ children, scheme, theme }: TsukiProviderProps) {
  const inheritedRuntime = useContext(OverlayRuntimeContext)
  const [ownedRegistry] = useState(() => (inheritedRuntime ? null : createOverlayRegistry()))
  const rootLease = useRef({ value: 0 })
  const [ownedHostEnabled, setOwnedHostEnabled] = useState(true)
  const registry = inheritedRuntime?.registry ?? ownedRegistry
  if (!registry) throw new Error('TsukiProvider could not resolve its OverlayRegistry.')
  const themeScope = useMemo(() => ({}), [])
  const hostEnabled = inheritedRuntime?.hostEnabled ?? ownedHostEnabled
  const setHostEnabled = inheritedRuntime?.setHostEnabled ?? setOwnedHostEnabled
  const value = useMemo<ResolvedTheme>(
    () => mergeTheme(getDefaultTheme(scheme), theme),
    [scheme, theme],
  )

  useEffect(() => {
    if (inheritedRuntime) return
    const leaseState = rootLease.current
    const lease = ++leaseState.value

    return () => {
      // StrictMode replays cleanup/setup synchronously. Deferring disposal to a microtask lets
      // the replay acquire a new lease while still disposing a permanently removed Root.
      void Promise.resolve().then(() => {
        if (leaseState.value === lease) registry.disposeRoot()
      })
    }
  }, [inheritedRuntime, registry])
  const runtime = useMemo(
    () => ({
      registry,
      theme: value,
      themeScope,
      rootTheme: inheritedRuntime?.rootTheme ?? value,
      rootThemeScope: inheritedRuntime?.rootThemeScope ?? themeScope,
      hostEnabled,
      setHostEnabled,
    }),
    [registry, value, themeScope, inheritedRuntime, hostEnabled, setHostEnabled],
  )

  useLayoutEffect(() => {
    registry.updateThemeScope(themeScope, value)
  }, [registry, themeScope, value])

  return (
    <ThemeContext.Provider value={value}>
      <OverlayRuntimeContext.Provider value={runtime}>
        {children}
        {!inheritedRuntime && hostEnabled ? <OverlayHost registry={registry} /> : null}
      </OverlayRuntimeContext.Provider>
    </ThemeContext.Provider>
  )
}
