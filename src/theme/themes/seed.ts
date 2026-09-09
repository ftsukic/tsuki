import type { PresetColorTokens } from '../interface'
import type { SeedToken } from '../interface'

export const defaultPresetColors: PresetColorTokens = {
  blue: '#1989FA',
  purple: '#7232DD',
  cyan: '#12B7CB',
  green: '#07C160',
  magenta: '#E91E63',
  pink: '#E91E63',
  red: '#EE0A24',
  orange: '#FF976A',
  yellow: '#FFD01E',
  volcano: '#FF6034',
  geekblue: '#2F54EB',
  lime: '#A0D911',
  gold: '#FAAD14',
}

export const defaultSeed: SeedToken = {
  ...defaultPresetColors,
  colorPrimary: '#1989FA',
  colorSuccess: '#07C160',
  colorWarning: '#FF976A',
  colorError: '#EE0A24',
  colorInfo: '#1989FA',
  colorLink: '#1989FA',
  colorTextBase: '#000000',
  colorBgBase: '#FFFFFF',
  fontFamily: 'System',
  fontSize: 14,
  lineWidth: 1,
  lineType: 'solid',
  borderRadius: 4,
  sizeUnit: 4,
  sizeStep: 4,
  controlHeight: 44,
  zIndexPopupBase: 1000,
  motion: true,
}
