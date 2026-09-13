import { createContext, useContext } from 'react'
import type { PickerRef } from '../picker/types'

export interface PickerGroupContextValue {
  index: number
  register(index: number, ref: PickerRef | null): void
}

const PickerGroupContext = createContext<PickerGroupContextValue | null>(null)

export const PickerGroupProvider = PickerGroupContext.Provider
export function usePickerGroup() {
  return useContext(PickerGroupContext)
}
