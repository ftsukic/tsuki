import { resolveTheme } from './resolve-theme'
import type { AliasToken } from './types/alias'
import type { DesignTokenConfig } from './types/config'

export function getDesignToken(theme: DesignTokenConfig = {}): AliasToken {
  return resolveTheme(theme).token
}
