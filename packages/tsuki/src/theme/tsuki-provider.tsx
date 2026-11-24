import { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { View } from 'react-native'
import { OverlayHost } from '../overlay/overlay-host'
import { OverlayAccessibilityBoundary } from '../overlay/accessibility/overlay-accessibility-boundary'
import {
  OverlayHostGeometryContext,
  OverlayRegistryContext,
  OverlayThemeScopeContext,
} from '../overlay/context'
import { createOverlayRegistry } from '../overlay/registry'
import { useStrictUnmountCleanup } from '../overlay/use-strict-mount-cleanup'
import { ThemeContext, ThemeScopeRendererContext } from './context'
import { getDefaultTheme } from './defaults'
import { mergeTheme } from './merge-theme'
import { serializeTheme } from './serialize-theme'
import type { ResolvedTheme, ThemeConfig, ThemeScheme, ThemeScopeRenderer } from './types'

export interface TsukiProviderProps extends PropsWithChildren {
  scheme: ThemeScheme
  theme?: ThemeConfig
  renderThemeScope?: ThemeScopeRenderer
}

export function TsukiProvider({ children, scheme, theme, renderThemeScope }: TsukiProviderProps) {
  const inheritedRegistry = useContext(OverlayRegistryContext)
  const inheritedThemeScope = useContext(OverlayThemeScopeContext)
  const inheritedGeometry = useContext(OverlayHostGeometryContext)
  const inheritedRenderer = useContext(ThemeScopeRendererContext)
  const effectiveRenderer = renderThemeScope ?? inheritedRenderer
  const isNested = inheritedRegistry !== null

  const [ownedRegistry] = useState(() => (isNested ? null : createOverlayRegistry()))
  const [ownedHostEnabled, setOwnedHostEnabled] = useState(true)
  const ownedRootHostRef = useRef<View>(null)
  const [ownedRootHostLayoutVersion, setOwnedRootHostLayoutVersion] = useState(0)
  const onOwnedRootHostLayout = useCallback(
    () => setOwnedRootHostLayoutVersion((version) => version + 1),
    [],
  )

  const registry = inheritedRegistry ?? ownedRegistry
  if (!registry) throw new Error('TsukiProvider could not resolve its OverlayRegistry.')

  const themeScope = useMemo(() => ({}), [])
  const hostEnabled = inheritedGeometry?.hostEnabled ?? ownedHostEnabled
  const setHostEnabled = inheritedGeometry?.setHostEnabled ?? setOwnedHostEnabled
  const rootHostRef = inheritedGeometry?.rootHostRef ?? ownedRootHostRef
  const rootHostLayoutVersion =
    inheritedGeometry?.rootHostLayoutVersion ?? ownedRootHostLayoutVersion
  const onRootHostLayout = inheritedGeometry?.onRootHostLayout ?? onOwnedRootHostLayout

  const value = useMemo<ResolvedTheme>(
    () => mergeTheme(getDefaultTheme(scheme), theme),
    [scheme, theme],
  )
  const variables = useMemo(() => serializeTheme(value), [value])

  useStrictUnmountCleanup(
    () => {
      if (!isNested) registry.disposeRoot()
    },
    [isNested, registry],
    'effect',
  )

  const rootTheme = inheritedThemeScope?.rootTheme ?? value
  const rootThemeScope = inheritedThemeScope?.rootThemeScope ?? themeScope
  const themeScopeValue = useMemo(
    () => ({
      theme: value,
      themeScope,
      rootTheme,
      rootThemeScope,
    }),
    [value, themeScope, rootTheme, rootThemeScope],
  )

  const hostGeometryValue = useMemo(
    () => ({
      hostEnabled,
      setHostEnabled,
      rootHostRef,
      rootHostLayoutVersion,
      onRootHostLayout,
    }),
    [hostEnabled, setHostEnabled, rootHostRef, rootHostLayoutVersion, onRootHostLayout],
  )

  useLayoutEffect(() => {
    registry.updateThemeScope(themeScope, value)
  }, [registry, themeScope, value])

  const content = isNested ? (
    children
  ) : (
    <>
      <OverlayAccessibilityBoundary registry={registry}>{children}</OverlayAccessibilityBoundary>
      {hostEnabled ? <OverlayHost registry={registry} /> : null}
    </>
  )
  const rendered = effectiveRenderer
    ? effectiveRenderer({
        theme: value,
        variables,
        kind: isNested ? 'scope' : 'root',
        children: content,
      })
    : content

  const inner = (
    <OverlayThemeScopeContext.Provider value={themeScopeValue}>
      {rendered}
    </OverlayThemeScopeContext.Provider>
  )

  return (
    <ThemeScopeRendererContext.Provider value={effectiveRenderer}>
      <ThemeContext.Provider value={value}>
        {isNested ? (
          inner
        ) : (
          <OverlayRegistryContext.Provider value={registry}>
            <OverlayHostGeometryContext.Provider value={hostGeometryValue}>
              {inner}
            </OverlayHostGeometryContext.Provider>
          </OverlayRegistryContext.Provider>
        )}
      </ThemeContext.Provider>
    </ThemeScopeRendererContext.Provider>
  )
}
