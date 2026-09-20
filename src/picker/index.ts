import { Picker as PickerComponent } from './picker'
import { showPicker } from './imperative'

export const Picker = Object.assign(PickerComponent, { open: showPicker })
export { PickerToolbar } from './picker-toolbar'
export { closePicker, showPicker } from './imperative'
export { getPickerToken } from './token'
export type { PickerToolbarProps } from './picker-toolbar'
export type {
  PickerAction,
  PickerChangeInfo,
  PickerColumnData,
  PickerColumnContext,
  PickerColumnSource,
  PickerColumns,
  PickerOptions,
  PickerOption,
  PickerProps,
  PickerRef,
  PickerSelection,
  PickerResult,
  PickerSemanticStyles,
  PickerStyleInfo,
  PickerStyleState,
  PickerStyles,
  PickerValue,
} from './types'

// Legacy implementation component retained for compatibility.
// Picker itself imports the real implementation path.
export { PickerColumn } from './picker-column'
export type { PickerColumnProps } from './picker-column'
