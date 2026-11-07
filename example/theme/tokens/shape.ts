import { StyleSheet } from 'react-native'
import type { AppShapeDefinition } from '../types'

export const shapeTokens: AppShapeDefinition = {
  radius: {
    scale: {
      none: 0,
      xs: 4,
      sm: 6,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 20,
      full: 999,
    },
    semantic: {
      control: 'xs',
      card: 'xl',
      sheet: '2xl',
      popover: 'lg',
      pill: 'full',
    },
  },
  borderWidth: {
    hairline: StyleSheet.hairlineWidth,
    default: 1,
    strong: 2,
  },
}
