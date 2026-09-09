import type { AliasToken, MapToken } from '../interface'
export function createAliasToken(map: MapToken, overrides: Partial<AliasToken> = {}): AliasToken {
  return {
    ...map,
    interactionActiveColor: map.colorFillTertiary,
    colorIcon: map.colorTextTertiary,
    colorTextPlaceholder: map.colorTextQuaternary,
    colorTextDisabled: map.colorTextQuaternary,
    colorBgContainerDisabled: map.colorFillTertiary,
    colorTextLightSolid: map.colorWhite,
    controlInteractiveSize: map.controlHeight / 2,
    controlItemBgActive: map.colorPrimaryBg,
    controlItemBgActiveDisabled: map.colorFill,
    paddingXXS: map.sizeXXS,
    paddingXS: map.sizeXS,
    paddingSM: map.sizeSM,
    padding: map.size,
    paddingLG: map.sizeLG,
    paddingXL: map.sizeXL,
    marginXXS: map.sizeXXS,
    marginXS: map.sizeXS,
    marginSM: map.sizeSM,
    margin: map.size,
    marginLG: map.sizeLG,
    marginXL: map.sizeXL,
    ...overrides,
  }
}
