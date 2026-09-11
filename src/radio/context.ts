import { createContext } from 'react'
import type { SelectionButtonLayout } from '../selection/selection-button-style'
import type { RadioValue, RadioVariant } from './interface'

export interface RadioGroupContextValue {
  value?: RadioValue
  disabled: boolean
  variant?: RadioVariant
  buttonLayout: SelectionButtonLayout
  select: (value: RadioValue) => boolean
}

export const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined)
