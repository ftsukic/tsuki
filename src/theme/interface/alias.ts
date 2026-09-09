import type { MapToken } from './map'

export interface AliasToken extends MapToken {
  interactionActiveColor: string
  colorIcon: string
  colorTextPlaceholder: string
  colorTextDisabled: string
  colorBgContainerDisabled: string
  colorTextLightSolid: string
  controlInteractiveSize: number
  controlItemBgActive: string
  controlItemBgActiveDisabled: string
  paddingXXS: number
  paddingXS: number
  paddingSM: number
  padding: number
  paddingLG: number
  paddingXL: number
  marginXXS: number
  marginXS: number
  marginSM: number
  margin: number
  marginLG: number
  marginXL: number
}
