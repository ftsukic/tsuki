import { getDefaultTheme } from './defaults'
import type { ResolvedTheme, ThemeConfig } from './types'

export function mergeTheme(parent: ResolvedTheme, override?: ThemeConfig): ResolvedTheme {
  const base = override?.inherit === false ? getDefaultTheme(parent.scheme) : parent

  return {
    scheme: parent.scheme,
    semantic: { ...base.semantic, ...override?.semantic },
    components: {
      Button: { ...base.components.Button, ...override?.components?.Button },
      Input: { ...base.components.Input, ...override?.components?.Input },
    },
  }
}
