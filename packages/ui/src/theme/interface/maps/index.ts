import type { ColorPalettes, LegacyColorPalettes } from '../presetColors'
import type { SeedToken } from '../seeds'
import type { ColorMapToken } from './colors'
import type { CommonMapToken } from './common'
import type { FontMapToken } from './font'
import type { HeightMapToken, SizeMapToken } from './size'
import type { StyleMapToken } from './style'

export * from './colors'
export * from './common'
export * from './font'
export * from './size'
export * from './style'

export interface MapToken
  extends
    SeedToken,
    ColorPalettes,
    LegacyColorPalettes,
    ColorMapToken,
    CommonMapToken,
    SizeMapToken,
    HeightMapToken,
    StyleMapToken,
    FontMapToken {}
