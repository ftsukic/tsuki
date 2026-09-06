import { createContext } from 'react'
import type { RadioButtonSize, RadioButtonStyle, RadioOptionType, RadioValue } from './interface'

export interface RadioGroupContextValue {
  value?: RadioValue
  disabled: boolean
  optionType: RadioOptionType
  buttonStyle: RadioButtonStyle
  size: RadioButtonSize
  block: boolean
  first: boolean
  last: boolean
  previousOptionType?: RadioOptionType
  select: (value: RadioValue) => boolean
}

export const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined)
