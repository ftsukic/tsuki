import { defaultAlgorithm } from './themes/default'
import { useContext, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { ThemeContext } from './context'
import type { ThemeConfig } from './types/config'
import { definedValues, EMPTY_THEME, resolveTheme } from './resolve-theme'

export function ConfigProvider({
  children,
  theme = EMPTY_THEME,
}: PropsWithChildren<{ theme?: ThemeConfig }>) {
  const parent = useContext(ThemeContext)
  const inherited = theme.inherit === false ? null : parent
  const { seed, token, algorithm, components, motion } = theme
  const parentSeed = inherited?.seedOverrides
  const parentToken = inherited?.tokenOverrides
  const parentAlgorithm = inherited?.algorithm
  const parentComponents = inherited?.componentOverrides
  const visual = useMemo(
    () =>
      resolveTheme(
        { seed, token, algorithm, components },
        {
          seedOverrides: parentSeed ?? {},
          tokenOverrides: parentToken ?? {},
          algorithm: parentAlgorithm ?? defaultAlgorithm,
          componentOverrides: parentComponents ?? {},
          motion: {},
        },
      ),
    [
      seed,
      token,
      algorithm,
      components,
      parentSeed,
      parentToken,
      parentAlgorithm,
      parentComponents,
    ],
  )
  const parentMotion = inherited?.motion
  const policy = useMemo(
    () => ({ ...parentMotion, ...definedValues(motion) }),
    [parentMotion, motion],
  )
  const value = useMemo(() => ({ ...visual, motion: policy }), [visual, policy])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
