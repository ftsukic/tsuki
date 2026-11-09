import { createContext } from 'react'

/** Private fixture instrumentation shared by Popup and Picker internals. */
export interface PerformanceProbeContextValue {
  runId: number
  onPopupFirstVisible?: (runId: number) => void
  onPickerOptionLayout?: (runId: number, columnIndex: number) => void
}

export const PerformanceProbeContext = createContext<PerformanceProbeContextValue | null>(null)
