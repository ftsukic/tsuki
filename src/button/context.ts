import { createContext } from 'react'
import type { ButtonGroupShape, ButtonSize } from './interface'

export type ButtonGroupPosition = 'first' | 'middle' | 'last' | 'only'

export interface ButtonGroupContextValue {
  size?: ButtonSize
  shape?: ButtonGroupShape
  block?: boolean
  position?: ButtonGroupPosition
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue>({})
