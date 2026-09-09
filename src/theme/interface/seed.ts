import type { PresetColorTokens } from './preset-colors'

export interface SeedToken extends PresetColorTokens {
  colorPrimary: string
  colorSuccess: string
  colorWarning: string
  colorError: string
  colorInfo: string
  colorLink: string
  colorTextBase: string
  colorBgBase: string
  fontFamily: string
  fontSize: number
  lineWidth: number
  lineType: 'solid' | 'dashed' | 'dotted'
  borderRadius: number
  sizeUnit: number
  sizeStep: number
  controlHeight: number
  zIndexPopupBase: number
  motion: boolean
}
