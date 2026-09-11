import { createContext } from 'react'
import type { SelectionButtonLayout } from '../selection/selection-button-style'
import type { CheckboxValue, CheckboxVariant } from './interface'

export interface CheckboxGroupContextValue {
  value: readonly CheckboxValue[]
  disabled: boolean
  variant?: CheckboxVariant
  buttonLayout: SelectionButtonLayout
  toggle: (name: CheckboxValue) => boolean
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | undefined>(undefined)
