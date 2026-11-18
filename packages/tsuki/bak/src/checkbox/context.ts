import { createContext } from 'react'
import type { SelectionButtonLayout } from '../selection/selection-button-style'
import type { ButtonVariant } from '../button/types'
import type { CheckboxValue, CheckboxVariant } from './types'

export interface CheckboxGroupContextValue {
  value: readonly CheckboxValue[]
  disabled: boolean
  variant?: CheckboxVariant
  buttonVariant?: ButtonVariant
  buttonLayout: SelectionButtonLayout
  toggle: (name: CheckboxValue) => boolean
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | undefined>(undefined)
