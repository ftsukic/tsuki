import { createContext } from 'react'
import type { CheckboxValue } from './interface'

export interface CheckboxGroupContextValue {
  value: readonly CheckboxValue[]
  disabled: boolean
  toggle: (name: CheckboxValue) => boolean
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | undefined>(undefined)
