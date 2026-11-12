import type { AliasToken, SliderToken } from '../theme'
import { getButtonToken } from '../button/token'

export function getSliderToken(token: AliasToken): SliderToken {
  return {
    railColor: token.colorFillSecondary,
    trackColor: token.colorPrimary,
    thumbColor: token.colorBgContainer,
    thumbBorderColor: token.colorBorder,
    railHeight: 2,
    thumbSize: 24,
    disabledOpacity: getButtonToken(token).disabledOpacity,
  }
}
