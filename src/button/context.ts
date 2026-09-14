import { createContext } from 'react'
import type { ButtonGroupShape, ButtonSize, ButtonVariant } from './types'

export type ButtonGroupPosition = 'first' | 'middle' | 'last' | 'only'

export interface ButtonGroupContextValue {
  size?: ButtonSize
  shape?: ButtonGroupShape
  variant?: ButtonVariant
  block?: boolean
  position?: ButtonGroupPosition
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue>({})
