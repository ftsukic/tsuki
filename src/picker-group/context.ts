import { createContext, useContext, useMemo } from 'react'
import type { PickerGroupChildRef } from './types'

export interface PickerGroupContextValue {
  index: number
  register(index: number, ref: PickerGroupChildRef | null): void
  registrationDisabled?: boolean
}

const PickerGroupContext = createContext<PickerGroupContextValue | null>(null)

export const PickerGroupProvider = PickerGroupContext.Provider
export function usePickerGroup() {
  return useContext(PickerGroupContext)
}

export function usePickerGroupRegistrationContext() {
  const group = usePickerGroup()
  return useMemo(() => (group ? { ...group, registrationDisabled: true } : null), [group])
}
