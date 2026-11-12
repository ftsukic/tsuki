import { createContext } from 'react'
import type { SelectionButtonLayout } from '../selection/selection-button-style'
import type { ButtonVariant } from '../button/types'
import type { RadioValue, RadioVariant } from './types'

export interface RadioGroupContextValue {
  value?: RadioValue
  disabled: boolean
  variant?: RadioVariant
  buttonVariant?: ButtonVariant
  buttonLayout: SelectionButtonLayout
  select: (value: RadioValue) => boolean
}

export const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined)
