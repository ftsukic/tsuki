import type { PresetColorType } from './presetColors'

export type { PresetColorType } from './presetColors'

export interface SeedToken extends PresetColorType {
  colorPrimary: string
  colorSuccess: string
  colorWarning: string
  colorError: string
  colorInfo: string
  colorLink: string
  colorTextBase: string
  colorBgBase: string

  fontFamily: string
  fontFamilyCode: string
  fontSize: number

  lineWidth: number
  lineType: 'solid' | 'dashed' | 'dotted'

  borderRadius: number
  sizeUnit: number
  sizeStep: number
  sizePopupArrow: number
  controlHeight: number
  zIndexBase: number
  zIndexPopupBase: number
  opacityImage: number

  motionUnit: number
  motionBase: number
  motionEaseOutCirc: string
  motionEaseInOutCirc: string
  motionEaseInOut: string
  motionEaseOutBack: string
  motionEaseInBack: string
  motionEaseInQuint: string
  motionEaseOutQuint: string
  motionEaseOut: string
  wireframe: boolean
  motion: boolean
}
