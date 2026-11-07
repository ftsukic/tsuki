export { colorTokens } from './colors'
export { typographyTokens } from './typography'
export { spacingTokens } from './spacing'
export { shapeTokens } from './shape'

import type { AppThemeDefinition } from '../types'
import { colorTokens } from './colors'
import { shapeTokens } from './shape'
import { spacingTokens } from './spacing'
import { typographyTokens } from './typography'

export const defaultAppTheme: AppThemeDefinition = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  shape: shapeTokens,
}
