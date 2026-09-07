import { createContext } from 'react'
import type { RadioValue } from './interface'

export interface RadioGroupContextValue {
  value?: RadioValue
  disabled: boolean
  select: (value: RadioValue) => boolean
}

export const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined)
